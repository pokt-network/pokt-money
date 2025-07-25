import { graphql } from '@/config/gql'
import { ExtractVariables } from '@/hooks/useFetchOnBlock'
import { getStartAndEndDateBasedOnTime } from '@/utils/dates'

export const monetaryBaseDocument = graphql(`
  query monetaryBase($startDate: Datetime!, $endDate: Datetime!, $truncInterval: String!) {
    monetaryBase: getMonetaryBaseByDate(startDate: $startDate, endDate: $endDate, truncInterval: $truncInterval)
  }
`)

export function getMonetaryBaseVariables(dateStr: string, timeSelected: string): ExtractVariables<typeof monetaryBaseDocument> {
  const {start, end, truncInterval} = getStartAndEndDateBasedOnTime(dateStr, timeSelected, true)

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    truncInterval,
  }
}
