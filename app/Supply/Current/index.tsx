import { getSupplyMetrics } from '@/api/supplyMetrics'
import type { SupplyMetrics } from '@/Supply/types'
import { Times } from '@/utils/dates'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import ClientCurrentSupply from '@/Supply/Current/Client'

interface CurrentSupplyProps {
  selectedTime: Times
}

async function ServerCurrentSupply({selectedTime}: CurrentSupplyProps) {
  let data: SupplyMetrics | null = null, error = false

  try {
    // Shares the cached queries with ChangesSupplyMintBurn within the same render.
    data = await getSupplyMetrics(selectedTime)
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
