import useFetchOnBlock, { DocumentNodeData, ExtractVariables } from '@/hooks/useFetchOnBlock'
import { getMonetaryBaseVariables, monetaryBaseDocument } from '@/MonetaryBase/operations'
import { normalizeIsoDate, Times } from '@/utils/dates'
import { useCallback, useMemo, useRef } from 'react'
import { fillChartData, LineBarItem } from '@/utils/chart'
import BaseLineBarChart from '@/components/BaseLineBarChart'
import { formatUpokt } from '@/utils/formatAmounts'
import RetryError from '@/components/ErrorRetry'

interface MonetaryBaseChartProps {
  initialData: DocumentNodeData<typeof monetaryBaseDocument> | null
  initialVariables: ExtractVariables<typeof monetaryBaseDocument>
  initialError: boolean
  selectedTime: Times
}

interface RawDataItem {
  date_truncated: string,
  lastest_block: number,
  amount: number
}

interface ProcessedDataItem extends LineBarItem {
  amount: number
}


export default function MonetaryBaseChart({
  initialVariables,
  initialError,
  initialData,
  selectedTime,
}: MonetaryBaseChartProps) {
  const lastVariables = useRef<ExtractVariables<typeof monetaryBaseDocument>>(initialVariables)

  const variables = useCallback((_: number, timestamp: string) => {
    return lastVariables.current = getMonetaryBaseVariables(timestamp, selectedTime)
  }, [])

  const {data, error, refetch, isLoading} = useFetchOnBlock({
    query: monetaryBaseDocument,
    variables,
    initialResult: initialData,
    initialError,
  })

  const processedData: Array<ProcessedDataItem> = useMemo(() => {
    if (!data?.monetaryBase) return []

    try {
      const parsedData: Array<RawDataItem> = JSON.parse(data.monetaryBase)

      return fillChartData({
        data: parsedData.map(
          (item) => ({
            amount: item.amount,
            id: '',
            point: normalizeIsoDate(item.date_truncated),
            start_date: normalizeIsoDate(item.date_truncated),
          })
        ),
        startDate: lastVariables?.current?.startDate,
        endDate: lastVariables?.current?.endDate,
        unitToFormatDate: lastVariables?.current?.truncInterval === 'hour' ? 'hour' : 'day',
        defaultProps: {
          amount: 0,
        }
      })
    } catch {
      return []
    }
  }, [])

  if (isLoading) {
    return (
      <div className={'h-[300px]'}>
        <BaseLineBarChart
          data={{}}
          yAxisKey={'amount'}
          yAxisLabel={''}
          lineColor={''}
          isLoading={true}
        />
      </div>
    )
  }

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
        data={{
          '': processedData
        }}
        yAxisKey={'amount'}
        yAxisLabel={''}
        lineColor={'#00CF9D'}
        chartType={'line'}
        formatValueAxisY={(value) => formatUpokt({
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
        unitToFormatDate={lastVariables.current?.truncInterval === 'hour' ? 'hour' : 'day'}
        beginAtZero={processedData.some((item) => item.amount === 0)}
      />
    </div>
  )

}
