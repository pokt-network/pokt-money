import { graphql } from '@/config/gql'
import { ExtractVariables } from '@/hooks/useFetchOnBlock'
import { getStartAndEndDateBasedOnTime } from '@/utils/dates'

export const currentSupplyDocument = graphql(`
  query currentSupply($startDate: Datetime!, $endDate: Datetime!) {
    currentSupply: getTotalSupplyBetweenDates(startDate: $startDate, endDate: $endDate)
  }
`)

// One document per aggregate function so each (function, window) pair can be cached
// independently server-side. See app/api/supplyMetrics.ts.
export const totalSupplyBetweenDatesDocument = graphql(`
  query totalSupplyBetweenDates($startDate: Datetime!, $endDate: Datetime!) {
    result: getTotalSupplyBetweenDates(startDate: $startDate, endDate: $endDate)
  }
`)

export const mintBreakdownBetweenDatesDocument = graphql(`
  query mintBreakdownBetweenDates($startDate: Datetime!, $endDate: Datetime!) {
    result: getMintBreakdownBetweenDates(startDate: $startDate, endDate: $endDate)
  }
`)

export const burnBreakdownBetweenDatesDocument = graphql(`
  query burnBreakdownBetweenDates($startDate: Datetime!, $endDate: Datetime!) {
    result: getBurnBreakdownBetweenDates(startDate: $startDate, endDate: $endDate)
  }
`)

export function getCurrentSupplyVariables(dateStr: string, timeSelected: string): ExtractVariables<typeof currentSupplyDocument> {
  const {start, end} = getStartAndEndDateBasedOnTime(dateStr, timeSelected)

  return {
    endDate: end.toISOString(),
    startDate: start.toISOString()
  }
}
