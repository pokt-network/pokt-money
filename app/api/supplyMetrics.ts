import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import { getClient } from '@/config/apollo/rsc'
import { getLatestBlock } from '@/api/blocks'
import {
  burnBreakdownBetweenDatesDocument,
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

/**
 * The indexer's *BetweenDates aggregate functions are expensive (tens of seconds and ~20 GB of
 * disk reads per call, independent of the window size), so we never call them with raw block
 * timestamps. The window end is floored to a bucket so the query variables, and therefore the
 * cache keys below, only change every WINDOW_BUCKET_MINUTES. Results are then kept in the Next.js
 * data cache for REVALIDATE_SECONDS, and React.cache dedupes the calls within a single render.
 */
export const WINDOW_BUCKET_MINUTES = 5
const REVALIDATE_SECONDS = 15 * 60

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

export const getMintBreakdownBetweenDates = cachedQuery(
  'mint_breakdown_between_dates',
  async (startDate, endDate): Promise<MintBreakdownBetweenDates | null> => {
    const { data } = await getClient().query({
      query: mintBreakdownBetweenDatesDocument,
      variables: { startDate, endDate },
    })

    return data?.result ?? null
  }
)

export const getBurnBreakdownBetweenDates = cachedQuery(
  'burn_breakdown_between_dates',
  async (startDate, endDate): Promise<BurnBreakdownBetweenDates | null> => {
    const { data } = await getClient().query({
      query: burnBreakdownBetweenDatesDocument,
      variables: { startDate, endDate },
    })

    return data?.result ?? null
  }
)

/**
 * Supply, mint and burn figures for the selected time range, anchored at the latest indexed block
 * (floored to the bucket). Only the windows the UI actually displays are queried: total supply for
 * both the current and the previous window, mint and burn for the current window only.
 */
export const getSupplyMetrics = cache(async (time: string): Promise<SupplyMetrics> => {
  const timeSelected = getValidTime(time)
  const latestBlock = await getLatestBlock()
  const anchor = floorDateToMinutes(latestBlock.timestamp, WINDOW_BUCKET_MINUTES)
  const { start, middle, end } = getStartMiddleAndEndDateBasedOnTime(anchor.toISOString(), timeSelected)

  const startDate = start.toISOString()
  const middleDate = middle.toISOString()
  const endDate = end.toISOString()

  const [currentSupply, previousSupply, currentMint, currentBurn] = await Promise.all([
    getTotalSupplyBetweenDates(middleDate, endDate),
    getTotalSupplyBetweenDates(startDate, middleDate),
    getMintBreakdownBetweenDates(middleDate, endDate),
    getBurnBreakdownBetweenDates(middleDate, endDate),
  ])

  return {
    timeSelected,
    startDate,
    middleDate,
    endDate,
    currentSupply,
    previousSupply,
    currentMint,
    currentBurn,
  }
})
