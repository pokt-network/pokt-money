import { graphql } from '@/config/gql'
import { ExtractVariables } from '@/hooks/useFetchOnBlock'
import { getStartAndEndDateBasedOnTime, getStartMiddleAndEndDateBasedOnTime } from '@/utils/dates'

export const currentSupplyDocument = graphql(`
  query currentSupply($startDate: Datetime!, $endDate: Datetime!) {
    currentSupply: getTotalSupplyBetweenDates(startDate: $startDate, endDate: $endDate)
  }
`)

export const supplyMintBurnAndChangesDocument = graphql(`
  query supplyMintBurnAndChanges($startDate: Datetime!, $middleDate: Datetime!, $endDate: Datetime!) {
    currentSupply: getTotalSupplyBetweenDates(startDate: $middleDate, endDate: $endDate)
    previousSupply: getTotalSupplyBetweenDates(startDate: $startDate, endDate: $middleDate)
    
    currentMint: getMintBreakdownBetweenDates(startDate: $middleDate, endDate: $endDate)
    previousMint: getMintBreakdownBetweenDates(startDate: $startDate, endDate: $middleDate)
    
    currentBurn: getBurnBreakdownBetweenDates(startDate: $middleDate, endDate: $endDate)
    previousBurn: getBurnBreakdownBetweenDates(startDate: $startDate, endDate: $middleDate)
  }
`)

export function getCurrentSupplyVariables(dateStr: string, timeSelected: string): ExtractVariables<typeof currentSupplyDocument> {
  const {start, end} = getStartAndEndDateBasedOnTime(dateStr, timeSelected)

  return {
    endDate: end.toISOString(),
    startDate: start.toISOString()
  }
}

export function getSupplyMintBurnAndChangesVariables(dateStr: string, timeSelected: string): ExtractVariables<typeof supplyMintBurnAndChangesDocument> {
  const {start, end, middle} = getStartMiddleAndEndDateBasedOnTime(dateStr, timeSelected)

  return {
    endDate: end.toISOString(),
    middleDate: middle.toISOString(),
    startDate: start.toISOString()
  }
}
