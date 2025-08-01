import { getClient } from '@/config/apollo/rsc'
import { totalSupplyDocument } from '@/api/operations'
import Big from 'big.js'

export async function GET() {
  const { data } = await getClient().query({
    query: totalSupplyDocument
  })

  const networkSupply = new Big(data?.blocks?.nodes?.at(0)?.supplies?.nodes?.at(0)?.supply?.amount || 0)
  const unmigratedSupply = new Big(data?.morseClaimableAccounts?.aggregates?.sum?.applicationStakeAmount || 0)
    .add(
      data?.morseClaimableAccounts?.aggregates?.sum?.supplierStakeAmount || 0
    )
    .add(
      data?.morseClaimableAccounts?.aggregates?.sum?.unstakedBalanceAmount || 0
    )

  return new Response(networkSupply.add(unmigratedSupply).div(1e6).toString(), {
    headers: { 'Content-Type': 'text/plain' }
  })
}
