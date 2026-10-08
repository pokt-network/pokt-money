import type { Times } from '@/utils/dates'
import type { MoneyRange } from '@/utils/moneyRange'

// Shapes of the JSON scalars returned by the indexer's supply aggregate functions.
export interface TotalSupplyBetweenDates {
  total_supply?: number | null
}

export interface MintBreakdownBetweenDates {
  mint_burn?: number | null
  inflation?: number | null
}

export interface BurnBreakdownBetweenDates {
  burn_mint?: number | null
}

/**
 * Everything the supply cards need for one time range, computed server-side from cached
 * per-function queries. `current*` cover [middleDate, endDate], `previousSupply` covers
 * [startDate, middleDate].
 */
export interface SupplyMetrics {
  timeSelected: Times
  startDate: string
  middleDate: string
  endDate: string
  currentSupply: TotalSupplyBetweenDates | null
  previousSupply: TotalSupplyBetweenDates | null
  currentMint: MintBreakdownBetweenDates | null
  currentBurn: BurnBreakdownBetweenDates | null
  // The part of [middleDate, endDate] the mint and burn figures cover; absent while the indexer
  // answers without ranges.
  currentMintBurnRange?: MoneyRange
  // The figures that are null because the indexer reports nothing covered for them; absent otherwise.
  uncoveredFigures?: Array<'mint' | 'burn'>
}
