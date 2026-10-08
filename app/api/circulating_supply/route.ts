import { getClient } from '@/config/apollo/rsc'
import { circulatingSupplyDocument } from '@/api/operations'
import Big from 'big.js'
import { freshCache } from '@/utils/freshCache'

// Every external hit used to query the indexer; the supply only moves once per block (~1 min). A
// cached value older than this is recomputed before answering (see freshCache).
const REVALIDATE_SECONDS = 60

const getCirculatingSupply = freshCache(
  'circulating_supply',
  async () => {
    const { data } = await getClient().query({
      query: circulatingSupplyDocument
    })

    return data
  },
  REVALIDATE_SECONDS * 1000
)

export async function GET() {
  const data = await getCirculatingSupply()

  const networkSupply = new Big(data?.blocks?.nodes?.at(0)?.supplies?.nodes?.at(0)?.supply?.amount || 0)
  const unmigratedSupply = new Big(data?.morseClaimableAccounts?.aggregates?.sum?.applicationStakeAmount || 0)
    .add(
      data?.morseClaimableAccounts?.aggregates?.sum?.supplierStakeAmount || 0
    )
    .add(
      data?.morseClaimableAccounts?.aggregates?.sum?.unstakedBalanceAmount || 0
    )

  // DAO tokens have no lock and can be sold at any moment, so they count as circulating and
  // circulating supply equals total supply. The DAO balance is still queried above in case the
  // subtraction is needed again later.
  return new Response(networkSupply.add(unmigratedSupply).div(1e6).toString(), {
    headers: { 'Content-Type': 'text/plain', 'Cache-Control': `public, max-age=${REVALIDATE_SECONDS}` }
  })
}
