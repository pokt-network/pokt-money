import { graphql } from '@/config/gql'

// One document per aggregate function so each (function, window) pair can be cached
// independently server-side. See app/api/supplyMetrics.ts.
export const totalSupplyBetweenDatesDocument = graphql(`
  query totalSupplyBetweenDates($startDate: Datetime!, $endDate: Datetime!) {
    result: getTotalSupplyBetweenDates(startDate: $startDate, endDate: $endDate)
  }
`)

// Mint and burn are read through the indexer's legacy* functions: the same arguments and JSON as the
// live get*BreakdownBetweenDates, from its settlement money tables, in under a second where the live
// ones take seconds to tens of seconds and the mint one times out over 60 days. The values are the
// live ones except at beta heights 153513 to 153693, where legacy mint counts 128 upokt of escrow the
// chain minted and the live function misses. They raise for a range those tables do not cover
// (before the first written settlement, or over a settlement gap).
export const legacyMintBreakdownBetweenDatesDocument = graphql(`
  query legacyMintBreakdownBetweenDates($startDate: Datetime!, $endDate: Datetime!) {
    result: legacyMintBreakdownBetweenDates(startDate: $startDate, endDate: $endDate)
  }
`)

export const legacyBurnBreakdownBetweenDatesDocument = graphql(`
  query legacyBurnBreakdownBetweenDates($startDate: Datetime!, $endDate: Datetime!) {
    result: legacyBurnBreakdownBetweenDates(startDate: $startDate, endDate: $endDate)
  }
`)

// The live functions, read only for a range the money tables do not cover. See app/api/supplyMetrics.ts.
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
