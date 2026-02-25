import { gql } from '@apollo/client'
import type { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { getStartAndEndDateBasedOnTime } from '@/utils/dates'

export interface CUTTMItem {
  date_truncated: string
  block_id: number
  value: string
}

export const getCUTTMEvolutionDocument: TypedDocumentNode<
  { getComputeUnitsToTokensMultiplierEvolution: Array<CUTTMItem> | null },
  { startDate: string; endDate: string; truncInterval: string }
> = gql`
  query getCUTTMEvolution($startDate: Datetime!, $endDate: Datetime!, $truncInterval: String!) {
    getComputeUnitsToTokensMultiplierEvolution(startDate: $startDate, endDate: $endDate, truncInterval: $truncInterval)
  }
`

export function getCUTTMEvolutionVariables(dateStr: string, timeSelected: string) {
  const { start, end, truncInterval } = getStartAndEndDateBasedOnTime(dateStr, timeSelected, true)

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    truncInterval,
  }
}
