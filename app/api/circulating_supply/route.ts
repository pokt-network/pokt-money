import { getClient } from '@/config/apollo/rsc'
import { circulatingSupplyDocument } from '@/api/operations'
import Big from 'big.js'

export async function GET() {
  const { data } = await getClient().query({
    query: circulatingSupplyDocument
  })

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
    headers: { 'Content-Type': 'text/plain' }
  })
}
