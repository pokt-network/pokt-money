import { Times } from '@/utils/dates'
import { getSupplyMetrics } from '@/api/supplyMetrics'
import type { SupplyMetrics } from '@/Supply/types'
import ClientSupplyMintBurn from '@/Supply/Changes/Client'
import { Suspense } from 'react'
import SupplyMintBurnLoader from '@/Supply/Changes/Loader'

interface ChangesSupplyMintBurnProps {
  selectedTime: Times
}
async function ServerChangesSupplyMintBurn({selectedTime}: ChangesSupplyMintBurnProps) {
  let data: SupplyMetrics | null = null, error = false

  try {
    data = await getSupplyMetrics(selectedTime)
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
