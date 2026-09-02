import { getSupplyMetrics } from '@/api/supplyMetrics'
import { getShannonSupplyByDay } from '@/api/supplyByDay'
import { Times } from '@/utils/dates'
import type { SupplyMetrics } from '@/Supply/types'
import type { ShannonSupplyByDay } from '@/SupplyProjection/types'
import ClientSupplyProjection from '@/SupplyProjection/Client'
import morseSupply from './morseSupplyByDay.json'

async function ServerSupplyProjection({selectedTime}: { selectedTime: Times}) {
  let error = false,
    supplyMetrics: SupplyMetrics | null = null,
    shannonSupplyData: ShannonSupplyByDay | null = null

  try {
    // Both are shared with the other supply cards / requests through the server cache.
    const [supplyMetricsRes, shannonSupplyUntilYesterdayData] = await Promise.all([
      getSupplyMetrics(selectedTime),
      getShannonSupplyByDay()
    ])

    supplyMetrics = supplyMetricsRes
    shannonSupplyData = shannonSupplyUntilYesterdayData
  } catch {
    error = true
  }

  return (
    <ClientSupplyProjection
      initialError={error}
      initialSupplyMetrics={supplyMetrics}
      initialShannonSupply={shannonSupplyData}
      selectedTime={selectedTime}
      morseSupply={morseSupply.data.ListSummaryBetweenDates.points}
    />
  )
}

export default function SupplyProjection({selectedTime}: { selectedTime: Times}) {
  return (
    <div className={'min-h-[420px] w-full bg-[color:var(--secondary-background)] px-4 rounded-md flex flex-col'}>
      <div className={'h-[50px] flex items-center'}>
        <h2>Supply 2Y Projection</h2>
      </div>
      <ServerSupplyProjection selectedTime={selectedTime} />
    </div>
  )
}
