import { unstable_cache } from 'next/cache'
import { getLatestBlock } from '@/api/blocks'
import { getClient } from '@/config/apollo/rsc'
import { getUtcEndOfDay, Times } from '@/utils/dates'
import { getShannonSupplyVariables, getTotalSupplyByDayDocument } from '@/SupplyProjection/operations'
import { currentSupplyDocument, getCurrentSupplyVariables } from '@/Supply/operations'
import ClientSupplyProjection from '@/SupplyProjection/Client'
import { DocumentNodeData } from '@/hooks/useFetchOnBlock'
import morseSupply from './morseSupplyByDay.json'

export interface SupplyByDayItem {
  day: string
  total_supply: number
}

const shannonSupplyUntilYesterday = unstable_cache(
  async (currentDate: string) => {
    const response = await getClient().query({
      query: getTotalSupplyByDayDocument,
      variables: getShannonSupplyVariables(currentDate)
    })

    return response.data as {
      getTotalSupplyByDay: Array<SupplyByDayItem>
    }
  },
  ['shannonSupplyUntilYesterday'],
  {
    tags: ['shannonSupplyUntilYesterday']
  }
)

async function ServerSupplyProjection({selectedTime}: { selectedTime: Times}) {
  let error = false,
    currentSupplyData: DocumentNodeData<typeof currentSupplyDocument> | null = null,
    shannonSupplyData: Awaited<ReturnType<typeof shannonSupplyUntilYesterday>> | null = null

  try {
    const latestBlock = await getLatestBlock()

    const [currentSupplyRes, shannonSupplyUntilYesterdayData] = await Promise.all([
      getClient().query({
        query: currentSupplyDocument,
        variables: getCurrentSupplyVariables(latestBlock.timestamp, selectedTime)
      }),
      // we are passing the end of the day to ensure the cache works for the same day
      shannonSupplyUntilYesterday(getUtcEndOfDay(latestBlock.timestamp).toISOString())
    ])

    currentSupplyData = currentSupplyRes.data
    shannonSupplyData = shannonSupplyUntilYesterdayData
  } catch {
    error = true
  }

  return (
    <ClientSupplyProjection
      initialError={error}
      initialCurrentSupply={currentSupplyData}
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
