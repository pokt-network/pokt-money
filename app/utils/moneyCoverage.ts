import type { GraphQLFormattedError } from 'graphql'

// Messages the indexer's money-table functions (legacy*, get*) raise for a range they do not cover:
// before the first written settlement, over a settlement gap, or before any settlement is written.
const COVERAGE_ERROR = /first written settlement|\(settlement_gaps\)|no settlement height is written yet/

/** True when a query failed only because the indexer's money tables do not cover the requested range. */
export function isMoneyCoverageError(error: unknown): boolean {
  const graphQLErrors = (error as { graphQLErrors?: ReadonlyArray<GraphQLFormattedError> } | null)?.graphQLErrors

  return !!graphQLErrors?.length && graphQLErrors.every(({ message }) => COVERAGE_ERROR.test(message))
}
