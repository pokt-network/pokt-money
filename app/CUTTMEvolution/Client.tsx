'use client'

import { useCallback, useMemo } from 'react'
import type { TooltipItem } from 'chart.js'
import { normalizeIsoDate, Times } from '@/utils/dates'
import BaseLineBarChart from '@/components/BaseLineBarChart'
import RetryError from '@/components/ErrorRetry'
import useFetchOnBlock from '@/hooks/useFetchOnBlock'
import {
  getCUTTMEvolutionDocument,
  getCUTTMEvolutionVariables,
  type CUTTMItem,
} from '@/CUTTMEvolution/operations'
import { fillChartData } from '@/utils/chart'

interface ProcessedItem {
  id: string
  point: string
  start_date: string
  value: number
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})

interface ClientCUTTMEvolutionProps {
  selectedTime: Times
}

export default function ClientCUTTMEvolution({
  selectedTime,
}: ClientCUTTMEvolutionProps) {
  const variables = useCallback((_: number, timestamp: string) => {
    return getCUTTMEvolutionVariables(timestamp, selectedTime)
  }, [selectedTime])

  const { data, error, refetch, isLoading } = useFetchOnBlock({
    query: getCUTTMEvolutionDocument,
    variables,
    initialError: false
  })

  const { processedData, truncInterval } = useMemo(() => {
    const vars = getCUTTMEvolutionVariables(new Date().toISOString(), selectedTime)
    const items: Array<ProcessedItem> = (data?.getComputeUnitsToTokensMultiplierEvolution ?? []).map((item: CUTTMItem) => {
      const normalized = normalizeIsoDate(item.date_truncated)
      return {
        id: normalized,
        point: normalized,
        start_date: normalized,
        value: Number(item.value),
      }
    })

    const filled = fillChartData({
      data: items,
      startDate: vars.startDate,
      endDate: vars.endDate,
      unitToFormatDate: vars.truncInterval === 'hour' ? 'hour' : 'day',
      defaultProps: { value: 0 },
    })

    const last = filled.at(-1)
    const prev = filled.at(-2)
    if (last && prev && last.value === 0) {
      last.value = prev.value
    }

    return { processedData: filled, truncInterval: vars.truncInterval }
  }, [data, selectedTime])

  if (error && !isLoading) {
    return (
      <div className={'flex grow items-center justify-center pb-12'}>
        <RetryError onRetry={refetch} />
      </div>
    )
  }

  return (
    <div className={'h-[360px]'}>
      <BaseLineBarChart
        data={{ '': processedData }}
        yAxisKey={'value'}
        yAxisLabel={'Compute Units to Tokens Multiplier'}
        lineColor={''}
        chartType={'line'}
        formatValueAxisY={(value) => Number(value).toLocaleString()}
        displayColorsInTooltip={true}
        getTooltipLabel={(item) => Number(item.value).toLocaleString()}
        unitToFormatDate={truncInterval === 'hour' ? 'hour' : 'day'}
        isLoading={isLoading || (!data && !error)}
        getCustomDatasetProps={() => ({
          fill: true,
          borderColor: '#B7ABFF',
          backgroundColor: 'rgba(183, 171, 255, 0.1)',
          tension: 0,
          borderWidth: 1.5,
          pointRadius: 0,
          pointHoverRadius: 4.5,
          pointHoverBorderWidth: 1,
          pointBackgroundColor: '#B7ABFF',
          pointBorderColor: '#615A83',
        })}
        customOptions={{
          interaction: {
            mode: 'index',
            axis: 'x',
          },
          scales: {
            x: {
              ticks: {
                maxRotation: 0,
              },
            },
            y: {
              grace: '20%',
              title: {
                font: {
                  weight: 'bold',
                }
              }
            },
          },
          plugins: {
            tooltip: {
              titleMarginBottom: 10,
              boxPadding: 6,
              callbacks: {
                title: function (tooltipItems: Array<TooltipItem<'bar'>>) {
                  const item = tooltipItems.at(0)?.raw as ProcessedItem
                  return dateFormatter.format(new Date(item?.start_date || ''))
                },
              },
            },
          },
        }}
        beginAtZero={false}
        gradientColors={[]}
      />
    </div>
  )
}
