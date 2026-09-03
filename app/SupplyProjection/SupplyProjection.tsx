import { Suspense } from 'react'
import { getCurrentSupplyMetrics } from '@/api/supplyMetrics'
import { getShannonSupplyByDay } from '@/api/supplyByDay'
import { Times } from '@/utils/dates'
import type { SupplyMetrics } from '@/Supply/types'
import type { ShannonSupplyByDay } from '@/SupplyProjection/types'
import ClientSupplyProjection from '@/SupplyProjection/Client'
import { Skeleton } from '@/components/ui/skeleton'
import morseSupply from './morseSupplyByDay.json'

async function ServerSupplyProjection({selectedTime}: { selectedTime: Times}) {
  let error = false,
    supplyMetrics: SupplyMetrics | null = null,
    shannonSupplyData: ShannonSupplyByDay | null = null

  try {
    // Only the current total supply is needed here; the mint/burn aggregates are not awaited so a
    // cold cache for this time range does not hold up the chart.
    const [supplyMetricsRes, shannonSupplyUntilYesterdayData] = await Promise.all([
      getCurrentSupplyMetrics(selectedTime),
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
      <Suspense
        key={selectedTime}
        fallback={(
          <div className={'h-[360px] pb-8'}>
            <Skeleton className={'h-full w-full'} />
          </div>
        )}
      >
        <ServerSupplyProjection selectedTime={selectedTime} />
      </Suspense>
    </div>
  )
}
