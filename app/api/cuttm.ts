import { unstable_cache } from 'next/cache'
import { getClient } from '@/config/apollo/rsc'
import { getLatestBlock } from '@/api/blocks'
import { getCUTTMEvolutionDocument, getCUTTMEvolutionVariables } from '@/CUTTMEvolution/operations'
import type { DocumentNodeData } from '@/hooks/useFetchOnBlock'
import { getValidTime } from '@/utils/dates'
import { dedupeInFlight } from '@/utils/dedupeInFlight'

const REVALIDATE_SECONDS = 60

export type CUTTMEvolution = DocumentNodeData<typeof getCUTTMEvolutionDocument>

export interface CUTTMEvolutionResult {
  data: CUTTMEvolution
  variables: ReturnType<typeof getCUTTMEvolutionVariables>
}

/**
 * Every open tab used to run getComputeUnitsToTokensMultiplierEvolution on each new block. The
 * window is rounded to the hour (24h) or the day, so the cache key below only changes once per hour
 * or day, and the value is refreshed at most every REVALIDATE_SECONDS.
 */
const cuttmEvolutionBetweenDates = dedupeInFlight(
  'cuttm_evolution_between_dates',
  unstable_cache(
    async (startDate: string, endDate: string, truncInterval: string): Promise<CUTTMEvolution> => {
      const { data } = await getClient().query({
        query: getCUTTMEvolutionDocument,
        variables: { startDate, endDate, truncInterval },
      })

      return data
    },
    ['cuttm_evolution_between_dates'],
    { revalidate: REVALIDATE_SECONDS }
  )
)

export async function getCUTTMEvolution(time: string): Promise<CUTTMEvolutionResult> {
  const latestBlock = await getLatestBlock()
  const variables = getCUTTMEvolutionVariables(latestBlock.timestamp, getValidTime(time))
  const data = await cuttmEvolutionBetweenDates(variables.startDate, variables.endDate, variables.truncInterval)

  return { data, variables }
}
