import { getClient } from '@/config/apollo/rsc'
import { totalSupplyDocument } from '@/api/operations'
import Big from 'big.js'
import { freshCache } from '@/utils/freshCache'

// Every external hit used to query the indexer; the supply only moves once per block (~1 min). A
// cached value older than this is recomputed before answering (see freshCache).
const REVALIDATE_SECONDS = 60

const getTotalSupply = freshCache(
  'total_supply',
  async () => {
    const { data } = await getClient().query({
      query: totalSupplyDocument
    })

    return data
  },
  REVALIDATE_SECONDS * 1000
)

export async function GET() {
  const data = await getTotalSupply()

  const networkSupply = new Big(data?.blocks?.nodes?.at(0)?.supplies?.nodes?.at(0)?.supply?.amount || 0)
  const unmigratedSupply = new Big(data?.morseClaimableAccounts?.aggregates?.sum?.applicationStakeAmount || 0)
    .add(
      data?.morseClaimableAccounts?.aggregates?.sum?.supplierStakeAmount || 0
    )
    .add(
      data?.morseClaimableAccounts?.aggregates?.sum?.unstakedBalanceAmount || 0
    )

  return new Response(networkSupply.add(unmigratedSupply).div(1e6).toString(), {
    headers: { 'Content-Type': 'text/plain', 'Cache-Control': `public, max-age=${REVALIDATE_SECONDS}` }
  })
}
