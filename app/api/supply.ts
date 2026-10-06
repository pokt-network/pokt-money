import { DocumentNodeData, ExtractVariables } from '@/hooks/useFetchOnBlock'
import { unstable_cache } from 'next/cache'
import { getClient } from "@/config/apollo/rsc"
import { getLatestBlock } from '@/api/blocks'
import { getSupplyCompositionVariables, supplyCompositionDocument } from '@/api/operations'
import { getValidTime } from '@/utils/dates'
import { dedupeInFlight } from '@/utils/dedupeInFlight'

const REVALIDATE_SECONDS = 60

export interface SupplyCompositionResult {
  data: DocumentNodeData<typeof supplyCompositionDocument> | null
  variables: ExtractVariables<typeof supplyCompositionDocument>
}

/**
 * getSupplyCompositionBetweenDates takes 1-2 s on the indexer and every open tab used to run it on
 * each new block. The window is rounded to the hour (24h) or the day, so the cache key below only
 * changes once per hour or day, and the value is refreshed at most every REVALIDATE_SECONDS.
 */
const supplyCompositionBetweenDates = dedupeInFlight(
  'supply_composition_between_dates',
  unstable_cache(
    async (startDate: string, endDate: string, truncInterval: string) => {
      const { data } = await getClient().query({
        query: supplyCompositionDocument,
        variables: { startDate, endDate, truncInterval },
      })

      return data
    },
    ['supply_composition_between_dates'],
    { revalidate: REVALIDATE_SECONDS }
  )
)

export async function getSupplyComposition(time: string): Promise<SupplyCompositionResult> {
  const latestBlock = await getLatestBlock()
  const variables = getSupplyCompositionVariables(latestBlock.timestamp, getValidTime(time))
  const data = await supplyCompositionBetweenDates(variables.startDate, variables.endDate, variables.truncInterval)

  return { data, variables }
}
