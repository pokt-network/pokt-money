import Big from 'big.js'
import { useMemo } from 'react'
import { normalizeIsoDate } from '@/utils/dates'
import RetryError from '@/components/ErrorRetry'
import { formatUpokt } from '@/utils/formatAmounts'
import { fillChartData, LineBarItem } from '@/utils/chart'
import BaseLineBarChart from '@/components/BaseLineBarChart'
import { useSupplyComposition } from '@/context/supplyComposition'

interface RawDataItem {
  date_truncated: string
  latest_block: number
  network_supply: number
  unmigrated_supply: number
  total_supply: number
  network_supply_composition: Array<{
    label: string
    amount: number
  }>
}

interface ProcessedDataItem extends LineBarItem {
  amount: number
}

export default function MonetaryBaseChart() {
  const {data, error, refetch, isLoading, lastVariables} = useSupplyComposition()

  const dataStr = useMemo(() => {
    if (!data) return ''

    return JSON.stringify(data)
  }, [data])

  const processedData: {data: Array<ProcessedDataItem> } = useMemo(() => {
    let arr: Array<ProcessedDataItem> = []
    if (!data?.supplyComposition) {
      arr = []
    } else {
      try {
        arr = fillChartData({
          data: data.supplyComposition.map(
            (item: RawDataItem) => ({
              amount: new Big(item.total_supply || 0).minus(
                item.network_supply_composition.find(({label}) => label === 'dao')?.amount || 0
              ).toNumber(),
              id: '',
              point: normalizeIsoDate(item.date_truncated),
              start_date: normalizeIsoDate(item.date_truncated),
            } as ProcessedDataItem)
          ) as Array<ProcessedDataItem>,
          startDate: lastVariables?.startDate,
          endDate: lastVariables?.endDate,
          unitToFormatDate: lastVariables?.truncInterval === 'hour' ? 'hour' : 'day',
          defaultProps: {
            amount: 0,
          }
        })
      } catch {
        arr = []
      }
    }

    return {
      'data': arr
    }
    // eslint-disable-next-line
  }, [dataStr])

  if (error) {
    return (
      <div className={'flex grow items-center justify-center pb-12'}>
        <RetryError
          onRetry={refetch}
        />
      </div>
    )
  }

  return (
    <div className={'h-[300px]'}>
      <BaseLineBarChart
        data={processedData}
        yAxisKey={'amount'}
        yAxisLabel={''}
        lineColor={'#00CF9D'}
        chartType={'line'}
        formatValueAxisY={(value) => isLoading ? value.toString() : formatUpokt({
          amount: value,
          includeSymbol: false,
        })}
        displayColorsInTooltip={false}
        getTooltipLabel={(item) => formatUpokt({
          amount: item.amount,
          includeSymbol: false,
          abbreviateThreshold: Number.MAX_SAFE_INTEGER,
          maxDecimals: 2,
        })}
        unitToFormatDate={lastVariables?.truncInterval === 'hour' ? 'hour' : 'day'}
        beginAtZero={processedData.data.some((item) => item.amount === 0)}
        isLoading={isLoading}
      />
    </div>
  )

}
