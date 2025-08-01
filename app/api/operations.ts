import type { ExtractVariables } from '@/hooks/useFetchOnBlock'
import { graphql } from '@/config/gql'
import { getStartAndEndDateBasedOnTime } from '@/utils/dates'

export const latestBlockQuery = graphql(`
  query latestBlock {
    blocks(orderBy: ID_DESC, first: 1) {
      nodes {
        hash
        height: id
        timestamp
        totalTxs
        proposerAddress
        size
        supplies {
          nodes {
            supply {
              denom
              amount
            }
          }
        }
        totalComputedUnits
        totalRelays
        failedTxs
        successfulTxs
        totalTxs
        stakedSuppliers
        stakedSuppliersTokens
        unstakingSuppliers
        unstakingSuppliersTokens
        timeToBlock
        unstakedSuppliers
        unstakedSuppliersTokens
        stakedApps
        stakedAppsTokens
        unstakingApps
        unstakingAppsTokens
        unstakedApps
        unstakedAppsTokens
        stakedGateways
        stakedGatewaysTokens
        unstakedGateways
        unstakedGatewaysTokens
      }
    }
  }
`)

export const subscriptionQuery = graphql(`
  subscription blocks {
    blocks {
      id
      mutation_type
      _entity {
        id
        height: id
        timestamp
      }
    }
  }
`)

export const numBlocksPerSessionDocument = graphql(`
  query numBlocksPerSession {
    params(
      filter:  {
        key:  {
          equalTo: "num_blocks_per_session"
        }
        namespace:  {
          equalTo: "shared"
        }
      }
      orderBy: [BLOCK_ID_DESC]
      first: 1
    ) {
      nodes {
        blockId
        key
        namespace
        value
      }
    }
  }
`)

export const indexerMetadataDocument = graphql(`
  query metadata {
    _metadata {
      targetHeight
      lastFinalizedVerifiedHeight
      lastProcessedHeight
      lastProcessedTimestamp
      indexerHealthy
    }
  }
`)

export const supplyCompositionDocument = graphql(`
  query supplyComposition($startDate: Datetime!, $endDate: Datetime!, $truncInterval: String!) {
    supplyComposition: getSupplyCompositionBetweenDates(startDate: $startDate, endDate: $endDate, truncInterval: $truncInterval)
  }
`)

export function getSupplyCompositionVariables(dateStr: string, timeSelected: string): ExtractVariables<typeof supplyCompositionDocument> {
  const {start, end, truncInterval} = getStartAndEndDateBasedOnTime(dateStr, timeSelected, true)

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    truncInterval,
  }
}


export const totalSupplyDocument = graphql(`
  query totalSupply {
    blocks(orderBy: ID_DESC, first: 1) {
      nodes {
        id
        supplies(filter: {supply: {denom: {equalTo: "upokt"}}}) {
          nodes {
            supply {
              amount
            }
          }
        }
      }
    }
    morseClaimableAccounts(filter: {claimed: {equalTo: false}}) {
      aggregates {
        sum {
          supplierStakeAmount
          applicationStakeAmount
          unstakedBalanceAmount
        }
      }
    }
  }
`)

export const circulatingSupplyDocument = graphql(`
  query circulatingSupply {
    blocks(orderBy: ID_DESC, first: 1) {
      nodes {
        id
        supplies(filter: {supply: {denom: {equalTo: "upokt"}}}) {
          nodes {
            supply {
              amount
            }
          }
        }
      }
    }
    morseClaimableAccounts(filter: {claimed: {equalTo: false}}) {
      aggregates {
        sum {
          supplierStakeAmount
          applicationStakeAmount
          unstakedBalanceAmount
        }
      }
    }
    dao: getDaoBalanceAtHeight
  }
`)
