import { getClient } from '@/config/apollo/rsc'
import { totalSupplyBetweenDatesDocument } from '@/Supply/operations'
import type { TotalSupplyBetweenDates } from '@/Supply/types'
import Big from 'big.js'
import { freshCache } from '@/utils/freshCache'

// Every external hit used to query the indexer; the supply only moves once per block (~1 min). A
// cached value older than this is recomputed before answering (see freshCache).
const REVALIDATE_SECONDS = 60
// getTotalSupplyBetweenDates answers for the latest indexed block in the range; a wide range keeps an
// indexer lag from turning the answer into null.
const LOOKBACK_MS = 30 * 24 * 60 * 60 * 1000

const getCirculatingSupply = freshCache(
  'circulating_supply',
  async () => {
    const endDate = new Date()
    const { data } = await getClient().query({
      query: totalSupplyBetweenDatesDocument,
      variables: { startDate: new Date(endDate.getTime() - LOOKBACK_MS).toISOString(), endDate: endDate.toISOString() }
    })

    // Fail instead of answering 0: a failure serves the last value (see freshCache) or an error.
    const totalSupply = (data?.result as TotalSupplyBetweenDates | null | undefined)?.total_supply
    if (totalSupply == null) {
      throw new Error('the indexer returned no total supply')
    }

    return totalSupply
  },
  REVALIDATE_SECONDS * 1000
)

export async function GET() {
  // DAO tokens have no lock and can be sold at any moment, so they count as circulating and
  // circulating supply equals total supply (network supply plus the Morse balances and stakes still
  // to claim, in upokt). Subtracting the DAO again needs getDaoBalanceAtHeight.
  const circulatingSupply = await getCirculatingSupply()

  return new Response(new Big(circulatingSupply).div(1e6).toString(), {
    headers: { 'Content-Type': 'text/plain', 'Cache-Control': `public, max-age=${REVALIDATE_SECONDS}` }
  })
}
