/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query monetaryBase($startDate: Datetime!, $endDate: Datetime!, $truncInterval: String!) {\n    monetaryBase: getMonetaryBaseByDate(startDate: $startDate, endDate: $endDate, truncInterval: $truncInterval)\n  }\n": typeof types.MonetaryBaseDocument,
    "\n  query currentSupplyMintBurn($startDate: Datetime!, $endDate: Datetime!) {\n    supply: getTotalSupplyBetweenDates(startDate: $startDate, endDate: $endDate)\n    mint: getMintBreakdownBetweenDates(startDate: $startDate, endDate: $endDate)\n    burn: getBurnBreakdownBetweenDates(startDate: $startDate, endDate: $endDate)\n  }\n": typeof types.CurrentSupplyMintBurnDocument,
    "\n  query currentSupply($startDate: Datetime!, $endDate: Datetime!) {\n    currentSupply: getTotalSupplyBetweenDates(startDate: $startDate, endDate: $endDate)\n  }\n": typeof types.CurrentSupplyDocument,
    "\n  query supplyMintBurnAndChanges($startDate: Datetime!, $middleDate: Datetime!, $endDate: Datetime!) {\n    currentSupply: getTotalSupplyBetweenDates(startDate: $middleDate, endDate: $endDate)\n    previousSupply: getTotalSupplyBetweenDates(startDate: $startDate, endDate: $middleDate)\n    \n    currentMint: getMintBreakdownBetweenDates(startDate: $middleDate, endDate: $endDate)\n    previousMint: getMintBreakdownBetweenDates(startDate: $startDate, endDate: $middleDate)\n    \n    currentBurn: getBurnBreakdownBetweenDates(startDate: $middleDate, endDate: $endDate)\n    previousBurn: getBurnBreakdownBetweenDates(startDate: $startDate, endDate: $middleDate)\n  }\n": typeof types.SupplyMintBurnAndChangesDocument,
    "\n  query latestBlock {\n    blocks(orderBy: ID_DESC, first: 1) {\n      nodes {\n        hash\n        height: id\n        timestamp\n        totalTxs\n        proposerAddress\n        size\n        supplies {\n          nodes {\n            supply {\n              denom\n              amount\n            }\n          }\n        }\n        totalComputedUnits\n        totalRelays\n        failedTxs\n        successfulTxs\n        totalTxs\n        stakedSuppliers\n        stakedSuppliersTokens\n        unstakingSuppliers\n        unstakingSuppliersTokens\n        timeToBlock\n        unstakedSuppliers\n        unstakedSuppliersTokens\n        stakedApps\n        stakedAppsTokens\n        unstakingApps\n        unstakingAppsTokens\n        unstakedApps\n        unstakedAppsTokens\n        stakedGateways\n        stakedGatewaysTokens\n        unstakedGateways\n        unstakedGatewaysTokens\n      }\n    }\n  }\n": typeof types.LatestBlockDocument,
    "\n  subscription blocks {\n    blocks {\n      id\n      mutation_type\n      _entity {\n        id\n        height: id\n        timestamp\n      }\n    }\n  }\n": typeof types.BlocksDocument,
    "\n  query numBlocksPerSession {\n    params(\n      filter:  {\n        key:  {\n          equalTo: \"num_blocks_per_session\"\n        }\n        namespace:  {\n          equalTo: \"shared\"\n        }\n      }\n      orderBy: [BLOCK_ID_DESC]\n      first: 1\n    ) {\n      nodes {\n        blockId\n        key\n        namespace\n        value\n      }\n    }\n  }\n": typeof types.NumBlocksPerSessionDocument,
    "\n  query metadata {\n    _metadata {\n      targetHeight\n      lastFinalizedVerifiedHeight\n      lastProcessedHeight\n      lastProcessedTimestamp\n      indexerHealthy\n    }\n  }\n": typeof types.MetadataDocument,
};
const documents: Documents = {
    "\n  query monetaryBase($startDate: Datetime!, $endDate: Datetime!, $truncInterval: String!) {\n    monetaryBase: getMonetaryBaseByDate(startDate: $startDate, endDate: $endDate, truncInterval: $truncInterval)\n  }\n": types.MonetaryBaseDocument,
    "\n  query currentSupplyMintBurn($startDate: Datetime!, $endDate: Datetime!) {\n    supply: getTotalSupplyBetweenDates(startDate: $startDate, endDate: $endDate)\n    mint: getMintBreakdownBetweenDates(startDate: $startDate, endDate: $endDate)\n    burn: getBurnBreakdownBetweenDates(startDate: $startDate, endDate: $endDate)\n  }\n": types.CurrentSupplyMintBurnDocument,
    "\n  query currentSupply($startDate: Datetime!, $endDate: Datetime!) {\n    currentSupply: getTotalSupplyBetweenDates(startDate: $startDate, endDate: $endDate)\n  }\n": types.CurrentSupplyDocument,
    "\n  query supplyMintBurnAndChanges($startDate: Datetime!, $middleDate: Datetime!, $endDate: Datetime!) {\n    currentSupply: getTotalSupplyBetweenDates(startDate: $middleDate, endDate: $endDate)\n    previousSupply: getTotalSupplyBetweenDates(startDate: $startDate, endDate: $middleDate)\n    \n    currentMint: getMintBreakdownBetweenDates(startDate: $middleDate, endDate: $endDate)\n    previousMint: getMintBreakdownBetweenDates(startDate: $startDate, endDate: $middleDate)\n    \n    currentBurn: getBurnBreakdownBetweenDates(startDate: $middleDate, endDate: $endDate)\n    previousBurn: getBurnBreakdownBetweenDates(startDate: $startDate, endDate: $middleDate)\n  }\n": types.SupplyMintBurnAndChangesDocument,
    "\n  query latestBlock {\n    blocks(orderBy: ID_DESC, first: 1) {\n      nodes {\n        hash\n        height: id\n        timestamp\n        totalTxs\n        proposerAddress\n        size\n        supplies {\n          nodes {\n            supply {\n              denom\n              amount\n            }\n          }\n        }\n        totalComputedUnits\n        totalRelays\n        failedTxs\n        successfulTxs\n        totalTxs\n        stakedSuppliers\n        stakedSuppliersTokens\n        unstakingSuppliers\n        unstakingSuppliersTokens\n        timeToBlock\n        unstakedSuppliers\n        unstakedSuppliersTokens\n        stakedApps\n        stakedAppsTokens\n        unstakingApps\n        unstakingAppsTokens\n        unstakedApps\n        unstakedAppsTokens\n        stakedGateways\n        stakedGatewaysTokens\n        unstakedGateways\n        unstakedGatewaysTokens\n      }\n    }\n  }\n": types.LatestBlockDocument,
    "\n  subscription blocks {\n    blocks {\n      id\n      mutation_type\n      _entity {\n        id\n        height: id\n        timestamp\n      }\n    }\n  }\n": types.BlocksDocument,
    "\n  query numBlocksPerSession {\n    params(\n      filter:  {\n        key:  {\n          equalTo: \"num_blocks_per_session\"\n        }\n        namespace:  {\n          equalTo: \"shared\"\n        }\n      }\n      orderBy: [BLOCK_ID_DESC]\n      first: 1\n    ) {\n      nodes {\n        blockId\n        key\n        namespace\n        value\n      }\n    }\n  }\n": types.NumBlocksPerSessionDocument,
    "\n  query metadata {\n    _metadata {\n      targetHeight\n      lastFinalizedVerifiedHeight\n      lastProcessedHeight\n      lastProcessedTimestamp\n      indexerHealthy\n    }\n  }\n": types.MetadataDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query monetaryBase($startDate: Datetime!, $endDate: Datetime!, $truncInterval: String!) {\n    monetaryBase: getMonetaryBaseByDate(startDate: $startDate, endDate: $endDate, truncInterval: $truncInterval)\n  }\n"): (typeof documents)["\n  query monetaryBase($startDate: Datetime!, $endDate: Datetime!, $truncInterval: String!) {\n    monetaryBase: getMonetaryBaseByDate(startDate: $startDate, endDate: $endDate, truncInterval: $truncInterval)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query currentSupplyMintBurn($startDate: Datetime!, $endDate: Datetime!) {\n    supply: getTotalSupplyBetweenDates(startDate: $startDate, endDate: $endDate)\n    mint: getMintBreakdownBetweenDates(startDate: $startDate, endDate: $endDate)\n    burn: getBurnBreakdownBetweenDates(startDate: $startDate, endDate: $endDate)\n  }\n"): (typeof documents)["\n  query currentSupplyMintBurn($startDate: Datetime!, $endDate: Datetime!) {\n    supply: getTotalSupplyBetweenDates(startDate: $startDate, endDate: $endDate)\n    mint: getMintBreakdownBetweenDates(startDate: $startDate, endDate: $endDate)\n    burn: getBurnBreakdownBetweenDates(startDate: $startDate, endDate: $endDate)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query currentSupply($startDate: Datetime!, $endDate: Datetime!) {\n    currentSupply: getTotalSupplyBetweenDates(startDate: $startDate, endDate: $endDate)\n  }\n"): (typeof documents)["\n  query currentSupply($startDate: Datetime!, $endDate: Datetime!) {\n    currentSupply: getTotalSupplyBetweenDates(startDate: $startDate, endDate: $endDate)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query supplyMintBurnAndChanges($startDate: Datetime!, $middleDate: Datetime!, $endDate: Datetime!) {\n    currentSupply: getTotalSupplyBetweenDates(startDate: $middleDate, endDate: $endDate)\n    previousSupply: getTotalSupplyBetweenDates(startDate: $startDate, endDate: $middleDate)\n    \n    currentMint: getMintBreakdownBetweenDates(startDate: $middleDate, endDate: $endDate)\n    previousMint: getMintBreakdownBetweenDates(startDate: $startDate, endDate: $middleDate)\n    \n    currentBurn: getBurnBreakdownBetweenDates(startDate: $middleDate, endDate: $endDate)\n    previousBurn: getBurnBreakdownBetweenDates(startDate: $startDate, endDate: $middleDate)\n  }\n"): (typeof documents)["\n  query supplyMintBurnAndChanges($startDate: Datetime!, $middleDate: Datetime!, $endDate: Datetime!) {\n    currentSupply: getTotalSupplyBetweenDates(startDate: $middleDate, endDate: $endDate)\n    previousSupply: getTotalSupplyBetweenDates(startDate: $startDate, endDate: $middleDate)\n    \n    currentMint: getMintBreakdownBetweenDates(startDate: $middleDate, endDate: $endDate)\n    previousMint: getMintBreakdownBetweenDates(startDate: $startDate, endDate: $middleDate)\n    \n    currentBurn: getBurnBreakdownBetweenDates(startDate: $middleDate, endDate: $endDate)\n    previousBurn: getBurnBreakdownBetweenDates(startDate: $startDate, endDate: $middleDate)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query latestBlock {\n    blocks(orderBy: ID_DESC, first: 1) {\n      nodes {\n        hash\n        height: id\n        timestamp\n        totalTxs\n        proposerAddress\n        size\n        supplies {\n          nodes {\n            supply {\n              denom\n              amount\n            }\n          }\n        }\n        totalComputedUnits\n        totalRelays\n        failedTxs\n        successfulTxs\n        totalTxs\n        stakedSuppliers\n        stakedSuppliersTokens\n        unstakingSuppliers\n        unstakingSuppliersTokens\n        timeToBlock\n        unstakedSuppliers\n        unstakedSuppliersTokens\n        stakedApps\n        stakedAppsTokens\n        unstakingApps\n        unstakingAppsTokens\n        unstakedApps\n        unstakedAppsTokens\n        stakedGateways\n        stakedGatewaysTokens\n        unstakedGateways\n        unstakedGatewaysTokens\n      }\n    }\n  }\n"): (typeof documents)["\n  query latestBlock {\n    blocks(orderBy: ID_DESC, first: 1) {\n      nodes {\n        hash\n        height: id\n        timestamp\n        totalTxs\n        proposerAddress\n        size\n        supplies {\n          nodes {\n            supply {\n              denom\n              amount\n            }\n          }\n        }\n        totalComputedUnits\n        totalRelays\n        failedTxs\n        successfulTxs\n        totalTxs\n        stakedSuppliers\n        stakedSuppliersTokens\n        unstakingSuppliers\n        unstakingSuppliersTokens\n        timeToBlock\n        unstakedSuppliers\n        unstakedSuppliersTokens\n        stakedApps\n        stakedAppsTokens\n        unstakingApps\n        unstakingAppsTokens\n        unstakedApps\n        unstakedAppsTokens\n        stakedGateways\n        stakedGatewaysTokens\n        unstakedGateways\n        unstakedGatewaysTokens\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  subscription blocks {\n    blocks {\n      id\n      mutation_type\n      _entity {\n        id\n        height: id\n        timestamp\n      }\n    }\n  }\n"): (typeof documents)["\n  subscription blocks {\n    blocks {\n      id\n      mutation_type\n      _entity {\n        id\n        height: id\n        timestamp\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query numBlocksPerSession {\n    params(\n      filter:  {\n        key:  {\n          equalTo: \"num_blocks_per_session\"\n        }\n        namespace:  {\n          equalTo: \"shared\"\n        }\n      }\n      orderBy: [BLOCK_ID_DESC]\n      first: 1\n    ) {\n      nodes {\n        blockId\n        key\n        namespace\n        value\n      }\n    }\n  }\n"): (typeof documents)["\n  query numBlocksPerSession {\n    params(\n      filter:  {\n        key:  {\n          equalTo: \"num_blocks_per_session\"\n        }\n        namespace:  {\n          equalTo: \"shared\"\n        }\n      }\n      orderBy: [BLOCK_ID_DESC]\n      first: 1\n    ) {\n      nodes {\n        blockId\n        key\n        namespace\n        value\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query metadata {\n    _metadata {\n      targetHeight\n      lastFinalizedVerifiedHeight\n      lastProcessedHeight\n      lastProcessedTimestamp\n      indexerHealthy\n    }\n  }\n"): (typeof documents)["\n  query metadata {\n    _metadata {\n      targetHeight\n      lastFinalizedVerifiedHeight\n      lastProcessedHeight\n      lastProcessedTimestamp\n      indexerHealthy\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;