import { graphql } from '@/config/gql'
import { ExtractVariables } from '@/hooks/useFetchOnBlock'
import { getStartAndEndDateBasedOnTime } from '@/utils/dates'
import { currentSupplyDocument } from '@/Supply/operations'

export const currentSupplyMintBurnDocument = graphql(`
  query currentSupplyMintBurn($startDate: Datetime!, $endDate: Datetime!) {
    supply: getTotalSupplyBetweenDates(startDate: $startDate, endDate: $endDate)
    mint: getMintBreakdownBetweenDates(startDate: $startDate, endDate: $endDate)
    burn: getBurnBreakdownBetweenDates(startDate: $startDate, endDate: $endDate)
  }
`)

export function getCurrentSupplyMintBurnVariables(dateStr: string, timeSelected: string): ExtractVariables<typeof currentSupplyDocument> {
  const {start, end} = getStartAndEndDateBasedOnTime(dateStr, timeSelected)

  return {
    endDate: end.toISOString(),
    startDate: start.toISOString()
  }
}
