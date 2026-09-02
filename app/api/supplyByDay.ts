import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import { getClient } from '@/config/apollo/rsc'
import { getLatestBlock } from '@/api/blocks'
import { getShannonSupplyVariables, getTotalSupplyByDayDocument } from '@/SupplyProjection/operations'
import type { ShannonSupplyByDay } from '@/SupplyProjection/types'
import { getUtcEndOfDay } from '@/utils/dates'
import { dedupeInFlight } from '@/utils/dedupeInFlight'

const REVALIDATE_SECONDS = 60 * 60

/**
 * Daily total supply since the Shannon migration, up to the end of the day before `currentDate`.
 * The series only changes once a day, so it is keyed by the (end of) day of the latest indexed
 * block and kept for an hour, which also covers the case where the indexer was still catching up
 * on yesterday's last blocks when the entry was first filled.
 */
const shannonSupplyUntilYesterday = cache(
  dedupeInFlight(
    'shannon_supply_until_yesterday',
    unstable_cache(
      async (currentDate: string): Promise<ShannonSupplyByDay> => {
        const response = await getClient().query({
          query: getTotalSupplyByDayDocument,
          variables: getShannonSupplyVariables(currentDate),
        })

        return response.data as ShannonSupplyByDay
      },
      ['shannonSupplyUntilYesterday'],
      { revalidate: REVALIDATE_SECONDS, tags: ['shannonSupplyUntilYesterday'] }
    )
  )
)

export const getShannonSupplyByDay = cache(async (): Promise<ShannonSupplyByDay> => {
  const latestBlock = await getLatestBlock()

  // end of the day so the cache key is the same for the whole day
  return shannonSupplyUntilYesterday(getUtcEndOfDay(latestBlock.timestamp).toISOString())
})
