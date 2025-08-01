import type { DocumentNodeData } from '@/hooks/useFetchOnBlock'
import { getLatestBlock } from '@/api/blocks'
import { getClient } from '@/config/apollo/rsc'
import { currentSupplyDocument, getCurrentSupplyVariables } from '@/Supply/operations'
import { Times } from '@/utils/dates'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import ClientCurrentSupply from '@/Supply/Current/Client'

interface CurrentSupplyProps {
  selectedTime: Times
}

async function ServerCurrentSupply({selectedTime}: CurrentSupplyProps) {
  let data: DocumentNodeData<typeof currentSupplyDocument> | null = null, error = false

  try {
    const latestBlock = await getLatestBlock()

    const response = await getClient().query({
      query: currentSupplyDocument,
      variables: getCurrentSupplyVariables(latestBlock.timestamp, selectedTime)
    })

    data = response.data
  } catch {
    error = true
  }

  return (
    <ClientCurrentSupply
      initialData={data}
      initialError={error}
      selectedTime={selectedTime}
    />
  )
}

export default function CurrentSupply({selectedTime}: CurrentSupplyProps) {
  return (
    <div className={'h-[160px] xl:h-[142px] w-full bg-[color:var(--secondary-background)] px-4 rounded-md'}>
      <div className={'h-[50px] flex items-center mb-2.5'}>
        <h2>Total Supply</h2>
      </div>
      <Suspense
        key={selectedTime}
        fallback={(
          <Skeleton className={'mt-4 h-7 w-[300px]'} />
        )}
      >
        <ServerCurrentSupply selectedTime={selectedTime} />
      </Suspense>
    </div>
  )
}
