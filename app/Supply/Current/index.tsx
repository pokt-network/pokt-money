import type { DocumentNodeData } from '@/hooks/useFetchOnBlock'
import { getLatestBlock } from '@/api/blocks'
import { getClient } from '@/config/apollo/rsc'
import { currentSupplyDocument, getCurrentSupplyVariables } from '@/Supply/operations'
import { currentSupplyMintBurnDocument, getCurrentSupplyMintBurnVariables } from '@/Projection/operations'
import { Times } from '@/utils/dates'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import ClientCurrentSupply from '@/Supply/Current/Client'

interface CurrentSupplyProps {
  selectedTime: Times
}

async function ServerCurrentSupply({selectedTime}: CurrentSupplyProps) {
  let data: DocumentNodeData<typeof currentSupplyDocument> | null = null,
    mintBurnData: DocumentNodeData<typeof currentSupplyMintBurnDocument> | null = null,
    error = false

  try {
    const latestBlock = await getLatestBlock()

    const [supplyRes, mintBurnRes] = await Promise.all([
      getClient().query({
        query: currentSupplyDocument,
        variables: getCurrentSupplyVariables(latestBlock.timestamp, selectedTime)
      }),
      getClient().query({
        query: currentSupplyMintBurnDocument,
        variables: getCurrentSupplyMintBurnVariables(latestBlock.timestamp, selectedTime)
      })
    ])

    data = supplyRes.data
    mintBurnData = mintBurnRes.data
  } catch {
    error = true
  }

  return (
    <ClientCurrentSupply
      initialData={data}
      initialMintBurnData={mintBurnData}
      initialError={error}
      selectedTime={selectedTime}
    />
  )
}

export default function CurrentSupply({selectedTime}: CurrentSupplyProps) {
  return (
    <div className={'min-h-[110px] xl:min-h-[160px] w-full bg-[color:var(--secondary-background)] px-4 pb-3 rounded-md'}>
      <div className={'h-[50px] flex items-center mb-1'}>
        <h2>Total Supply</h2>
      </div>
      <Suspense
        key={selectedTime}
        fallback={(
          <div className={'flex flex-row flex-wrap gap-x-2.5 gap-y-5 items-center mt-2'}>
            <Skeleton className={'h-8 w-[260px]'} />
            <Skeleton className={'h-4 w-[80px]'} />
          </div>
        )}
      >
        <ServerCurrentSupply selectedTime={selectedTime} />
      </Suspense>
    </div>
  )
}
