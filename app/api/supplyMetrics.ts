import { unstable_cache } from 'next/cache'
import { after } from 'next/server'
import { cache } from 'react'
import type { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { getClient } from '@/config/apollo/rsc'
import { getLatestBlock } from '@/api/blocks'
import {
  burnBreakdownBetweenDatesDocument,
  legacyBurnBreakdownBetweenDatesDocument,
  legacyMintBreakdownBetweenDatesDocument,
  mintBreakdownBetweenDatesDocument,
  totalSupplyBetweenDatesDocument,
} from '@/Supply/operations'
import type {
  BurnBreakdownBetweenDates,
  MintBreakdownBetweenDates,
  SupplyMetrics,
  TotalSupplyBetweenDates,
} from '@/Supply/types'
import { floorDateToMinutes, getStartMiddleAndEndDateBasedOnTime, getValidTime } from '@/utils/dates'
import { dedupeInFlight } from '@/utils/dedupeInFlight'
import { isMoneyCoverageError } from '@/utils/moneyCoverage'
import { readRangedFigures } from '@/utils/moneyRange'

/**
 * The indexer's *BetweenDates aggregate functions are the most expensive calls this app makes, so we
 * never call them with raw block timestamps. The window end is floored to a bucket so the query
 * variables, and therefore the cache keys below, only change every WINDOW_BUCKET_MINUTES. Results
 * are then kept in the Next.js data cache for REVALIDATE_SECONDS, and React.cache dedupes the calls
 * within a single render.
 */
export const WINDOW_BUCKET_MINUTES = Number(process.env.SUPPLY_WINDOW_BUCKET_MINUTES) || 5
const REVALIDATE_SECONDS = 15 * 60

/**
 * How long a render waits for a cold aggregate fetch before falling back to the last result for
 * the same time range. The fetch keeps running (see `after`) and fills the cache for the next
 * request, so the first visitor after a bucket rollover sees numbers that are at most one bucket
 * old instead of a 30 s+ loader.
 */
const STALE_FALLBACK_AFTER_MS = Number(process.env.SUPPLY_STALE_FALLBACK_MS) || 2000
const lastMetricsByRange = new Map<string, SupplyMetrics>()

function cachedQuery<Result>(
  name: string,
  run: (startDate: string, endDate: string) => Promise<Result>
) {
  return cache(
    dedupeInFlight(
      name,
      unstable_cache(run, [name], { revalidate: REVALIDATE_SECONDS })
    )
  )
}

export const getTotalSupplyBetweenDates = cachedQuery(
  'total_supply_between_dates',
  async (startDate, endDate): Promise<TotalSupplyBetweenDates | null> => {
    const { data } = await getClient().query({
      query: totalSupplyBetweenDatesDocument,
      variables: { startDate, endDate },
    })

    return data?.result ?? null
  }
)

type BetweenDatesDocument<Result> = TypedDocumentNode<{ result?: Result | null }, { startDate: string, endDate: string }>

/**
 * Only for the indexer's bare shape: there the legacy* functions (see app/Supply/operations.ts) raise
 * for a range its money tables do not cover (before the first written settlement, or over a
 * settlement gap), and only that error falls back to the live function, so a window that answered
 * before still answers. The {range, data} shape never raises for coverage, so it never takes this
 * path: its uncovered windows come back as unknown (see readRangedFigures).
 */
async function queryWithLiveFallback<Result>(
  legacyQuery: BetweenDatesDocument<Result>,
  liveQuery: BetweenDatesDocument<Result>,
  startDate: string,
  endDate: string
): Promise<Result | null> {
  const variables = { startDate, endDate }

  try {
    const { data } = await getClient().query({ query: legacyQuery, variables })

    return data?.result ?? null
  } catch (error) {
    if (!isMoneyCoverageError(error)) {
      throw error
    }

    const { data } = await getClient().query({ query: liveQuery, variables })

    return data?.result ?? null
  }
}

export const getMintBreakdownBetweenDates = cachedQuery(
  // The legacy_ prefix keeps values cached by releases that read the live function out of this key.
  // The value is the raw answer in either of the indexer's shapes (bare JSON or {range, data}), which
  // getSupplyMetrics reads; with the bare shape, a range outside the money coverage comes from the
  // live function (queryWithLiveFallback).
  'legacy_mint_breakdown_between_dates',
  // The raw answer, in either shape (see unwrapRange): getSupplyMetrics unwraps it.
  (startDate, endDate): Promise<unknown> => queryWithLiveFallback(
    legacyMintBreakdownBetweenDatesDocument,
    mintBreakdownBetweenDatesDocument,
    startDate,
    endDate
  )
)

export const getBurnBreakdownBetweenDates = cachedQuery(
  'legacy_burn_breakdown_between_dates',
  (startDate, endDate): Promise<unknown> => queryWithLiveFallback(
    legacyBurnBreakdownBetweenDatesDocument,
    burnBreakdownBetweenDatesDocument,
    startDate,
    endDate
  )
)

/** Query window for the selected time range, anchored at the latest indexed block floored to the bucket. */
export const getSupplyWindow = cache(async (time: string) => {
  const timeSelected = getValidTime(time)
  const latestBlock = await getLatestBlock()
  const anchor = floorDateToMinutes(latestBlock.timestamp, WINDOW_BUCKET_MINUTES)
  const { start, middle, end } = getStartMiddleAndEndDateBasedOnTime(anchor.toISOString(), timeSelected)

  return {
    timeSelected,
    startDate: start.toISOString(),
    middleDate: middle.toISOString(),
    endDate: end.toISOString(),
  }
})

function withStaleFallback(time: string, fresh: Promise<SupplyMetrics>): Promise<SupplyMetrics> {
  const remembered = fresh.then((metrics) => {
    lastMetricsByRange.set(time, metrics)
    return metrics
  })
  // Never let a background failure surface as an unhandled rejection.
  remembered.catch(() => {})

  const stale = lastMetricsByRange.get(time)
  if (!stale) {
    return remembered
  }

  return new Promise<SupplyMetrics>((resolve, reject) => {
    const timer = setTimeout(() => {
      // Keep the fetch alive past the end of this response so it fills the cache.
      after(() => remembered.catch(() => {}))
      resolve(stale)
    }, STALE_FALLBACK_AFTER_MS)

    remembered.then(
      (metrics) => { clearTimeout(timer); resolve(metrics) },
      (error) => { clearTimeout(timer); reject(error) },
    )
  })
}

/**
 * Supply, mint and burn figures for the selected time range. Only the windows the UI actually
 * displays are queried: total supply for both the current and the previous window, mint and burn
 * for the current window only.
 */
export const getSupplyMetrics = cache((time: string): Promise<SupplyMetrics> => {
  const fresh = (async () => {
    const window = await getSupplyWindow(time)
    const { startDate, middleDate, endDate } = window

    const [currentSupply, previousSupply, rawMint, rawBurn] = await Promise.all([
      getTotalSupplyBetweenDates(middleDate, endDate),
      getTotalSupplyBetweenDates(startDate, middleDate),
      getMintBreakdownBetweenDates(middleDate, endDate),
      getBurnBreakdownBetweenDates(middleDate, endDate),
    ])

    // null mint or burn means unknown (its range covers nothing); the clients only read that. The
    // range is present only when the indexer reports one, so the bare shape's JSON is unchanged.
    const { a: mint, b: burn, range: currentMintBurnRange } =
      readRangedFigures<MintBreakdownBetweenDates, BurnBreakdownBetweenDates>(rawMint, rawBurn)
    const uncoveredFigures = [...(mint.uncovered ? ['mint' as const] : []), ...(burn.uncovered ? ['burn' as const] : [])]

    return {
      ...window,
      currentSupply,
      previousSupply,
      currentMint: mint.value,
      currentBurn: burn.value,
      ...(currentMintBurnRange && { currentMintBurnRange }),
      ...(uncoveredFigures.length > 0 && { uncoveredFigures }),
    }
  })()

  return withStaleFallback(getValidTime(time), fresh)
})

/**
 * Cheap subset for components that only need the current total supply (the 2Y projection):
 * one getTotalSupplyBetweenDates call, no mint/burn aggregates to wait for.
 */
export const getCurrentSupplyMetrics = cache(async (time: string): Promise<SupplyMetrics> => {
  const window = await getSupplyWindow(time)
  const currentSupply = await getTotalSupplyBetweenDates(window.middleDate, window.endDate)

  return { ...window, currentSupply, previousSupply: null, currentMint: null, currentBurn: null }
})
