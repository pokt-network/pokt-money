import { graphql } from '@/config/gql'
import { addDaysToUtc, getUtcEndOfDay } from '@/utils/dates'
import { ExtractVariables } from '@/hooks/useFetchOnBlock'

export const getTotalSupplyByDayDocument = graphql(`
  query getTotalSupplyByDay($startDate: Datetime!, $endDate: Datetime!) {
    getTotalSupplyByDay(startDate: $startDate, endDate: $endDate)
  }
`)

export const startDateMigration = "2025-06-03"

export function getShannonSupplyVariables(currentDate: string): ExtractVariables<typeof getTotalSupplyByDayDocument> {
  // day of migration
  const endDate = getUtcEndOfDay(addDaysToUtc(currentDate, -1))

  return {
    startDate: startDateMigration,
    endDate: endDate.toISOString()
  }
}
