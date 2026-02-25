import { Times } from '@/utils/dates'
import { DocumentNodeData } from '@/hooks/useFetchOnBlock'
import { getSupplyMintBurnAndChangesVariables, supplyMintBurnAndChangesDocument } from '@/Supply/operations'
import { getLatestBlock } from '@/api/blocks'
import { getClient } from '@/config/apollo/rsc'
import ClientSupplyMintBurn from '@/Supply/Changes/Client'
import { Suspense } from 'react'
import SupplyMintBurnLoader from '@/Supply/Changes/Loader'

interface ChangesSupplyMintBurnProps {
  selectedTime: Times
}
async function ServerChangesSupplyMintBurn({selectedTime}: ChangesSupplyMintBurnProps) {
  let data: DocumentNodeData<typeof supplyMintBurnAndChangesDocument> | null = null, error = false

  try {
    const latestBlock = await getLatestBlock()

    const response = await getClient().query({
      query: supplyMintBurnAndChangesDocument,
      variables: getSupplyMintBurnAndChangesVariables(latestBlock.timestamp, selectedTime)
    })

    data = response.data
  } catch {
    error = true
  }

  return (
    <ClientSupplyMintBurn
      initialData={data}
      initialError={error}
      selectedTime={selectedTime}
    />
  )
}


export default function ChangesSupplyMintBurn({selectedTime}: ChangesSupplyMintBurnProps) {
  return (
    <div className={'min-h-[110px] xl:min-h-[160px] w-full bg-[color:var(--secondary-background)] px-4 pb-3 rounded-md'}>
      <div className={'h-[50px] flex items-center'}>
        <h2>Supply Change</h2>
      </div>

      <Suspense
        key={selectedTime}
        fallback={
          <SupplyMintBurnLoader />
        }
      >
        <ServerChangesSupplyMintBurn selectedTime={selectedTime} />
      </Suspense>
    </div>
  )
}
