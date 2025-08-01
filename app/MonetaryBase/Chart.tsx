import Big from 'big.js'
import { useMemo } from 'react'
import { normalizeIsoDate } from '@/utils/dates'
import RetryError from '@/components/ErrorRetry'
import { formatUpokt } from '@/utils/formatAmounts'
import { fillChartData, LineBarItem } from '@/utils/chart'
import BaseLineBarChart from '@/components/BaseLineBarChart'
import { useSupplyComposition } from '@/context/supplyComposition'
import LegendItem from '@/components/LegendItem'

const colorsByLabel: Record<string, {line: string, bg: string, border: string}> = {
  'totalSupply': {
    line: '#B7ABFF',
    bg: 'rgba(183, 171, 255, 0.1)',
    border: '#615A83'
  },
  'monetaryBase': {
    line: '#00CF9D',
    bg: 'rgba(0, 207, 157, 0.1)',
    border: '#087059'
  },
}

const legendsItems = [
  {
    label: 'Total Supply',
    boxColor: colorsByLabel.totalSupply.line,
  },
  {
    label: 'Circulating Supply',
    boxColor: colorsByLabel.monetaryBase.line,
  },
]

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

interface ProcessedDataItem<T extends string> extends LineBarItem {
  id: T
  chartAmount: number
  realAmount: number
  start_date: string
  point: string
}

function getItem<T extends string>(id: T, chartAmount: number, realAmount: number, date: string): ProcessedDataItem<T> {
  const normalizedDate = normalizeIsoDate(date)

  return {
    id,
    chartAmount: chartAmount || 0,
    realAmount: realAmount || 0,
    start_date: normalizedDate,
    point: normalizedDate,
  }
}


export default function MonetaryBaseChart() {
  const {data, error, refetch, isLoading, lastVariables} = useSupplyComposition()

  const dataStr = useMemo(() => {
    if (!data) return ''

    return JSON.stringify(data)
  }, [data])

  const processedData: Record<string, Array<ProcessedDataItem<string>>> = useMemo(() => {
    const monetaryBase: Array<ProcessedDataItem<'monetaryBase'>> = [],
      totalSupply: Array<ProcessedDataItem<'totalSupply'>> = []

    if (isLoading || !data) {
      return {
        monetaryBase,
        totalSupply
      }
    }

    if (data?.supplyComposition?.length) {
      for (let i = 0; i < data.supplyComposition.length; i++) {
        const item: RawDataItem = data.supplyComposition[i]

        const supply = new Big(item.total_supply || 0)
        const dao = item.network_supply_composition.find(({label}) => label === 'dao')?.amount || 0

        const monetaryBaseValue = supply.minus(dao).toNumber()
        const totalSupplyValue = supply.toNumber()

        monetaryBase.push(getItem('monetaryBase', monetaryBaseValue, monetaryBaseValue, item.date_truncated))
        totalSupply.push(getItem('totalSupply', dao, totalSupplyValue, item.date_truncated))
      }
    }

    function fillData<T extends string>(id: T, arr: Array<ProcessedDataItem<T>>) {
      return fillChartData({
        data: arr,
        startDate: lastVariables?.startDate,
        endDate: lastVariables?.endDate,
        unitToFormatDate: lastVariables?.truncInterval === 'hour' ? 'hour' : 'day',
        defaultProps: {
          id,
          chartAmount: 0,
          realAmount: 0,
        }
      })
    }


    return {
      monetaryBase: fillData('monetaryBase', monetaryBase),
      totalSupply: fillData('totalSupply', totalSupply),
    }
    // eslint-disable-next-line
  }, [dataStr])

  const chart = useMemo(() => {
    return (
      <BaseLineBarChart
        data={processedData}
        yAxisKey={'chartAmount'}
        yAxisLabel={'POKTs'}
        lineColor={''}
        chartType={'line'}
        formatValueAxisY={(value) => isLoading ? value.toString() : formatUpokt({
          amount: value,
          includeSymbol: false,
        })}
        displayColorsInTooltip={true}
        getTooltipLabel={(item) => formatUpokt({
          amount: item.realAmount,
          includeSymbol: false,
          abbreviateThreshold: Number.MAX_SAFE_INTEGER,
          maxDecimals: 2,
        })}
        unitToFormatDate={lastVariables?.truncInterval === 'hour' ? 'hour' : 'day'}
        isLoading={isLoading}
        getCustomDatasetProps={(id) => {
          const {bg, line, border} = colorsByLabel[id] || {}
          return {
            stack: true,
            fill: true,
            borderColor: line,
            backgroundColor: bg,
            tension: 0,
            borderWidth: 1.5,
            pointRadius: 0,
            pointHoverRadius: 4.5,
            pointHoverBorderWidth: 1,
            pointBackgroundColor: line,
            pointBorderColor: border,
          }
        }}
        customOptions={{
          interaction: {
            mode: 'index',
            axis: 'x',
          },
          scales: {
            y: {
              stacked: true,
              grace: '10%',
            }
          },
          plugins: {
            tooltip: {
              titleMarginBottom: 10,
              itemSort: (a, b) => {
                return (b.raw as ProcessedDataItem<string>).realAmount - (a.raw as ProcessedDataItem<string>).realAmount
              },
            }
          }
        }}
        beginAtZero={true}
        gradientColors={[]}
      />
    )
    // eslint-disable-next-line
  }, [processedData, isLoading])

  if (error && !isLoading) {
    return (
      <div className={'flex grow items-center justify-center pb-12'}>
        <RetryError
          onRetry={refetch}
        />
      </div>
    )
  }

  return (
    <>
      <div className={'flex flex-row flex-wrap gap-x-8 gap-y-2 pt-0 pb-4'}>
        {legendsItems.map((item) => {
          return (
            <LegendItem
              key={item.label}
              label={item.label}
              boxColor={item.boxColor}
              loading={isLoading || (!data && !error)}
            />
          )
        })}
      </div>
      <div className={'h-[270px]'}>
        {chart}
      </div>
    </>
  )
}
