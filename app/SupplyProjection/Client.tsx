'use client'
import type { SupplyByDayItem } from '@/SupplyProjection/SupplyProjection'
import { useCallback, useMemo } from 'react'
import { ScriptableContext, type TooltipItem } from 'chart.js'
import { addDaysToUtc, getUtcEndOfDay, getUtcStartOfDay, normalizeIsoDate, Times } from '@/utils/dates'
import { currentSupplyDocument, getCurrentSupplyVariables } from '@/Supply/operations'
import useFetchOnBlock, { DocumentNodeData } from '@/hooks/useFetchOnBlock'
import BaseLineBarChart from '@/components/BaseLineBarChart'
import useDidMountEffect from '@/hooks/useDidMountEffect'
import { useHeightContext } from '@/context/height'
import { formatUpokt } from '@/utils/formatAmounts'
import RetryError from '@/components/ErrorRetry'
import { fillChartData } from '@/utils/chart'
import {
  getShannonSupplyVariables,
  getTotalSupplyByDayDocument,
  startDateMigration,
} from '@/SupplyProjection/operations'
import Big from 'big.js'

interface LineLabel {
  date: string
  label: string | Array<string>
  xAdjust?: number
  yAdjust?: number
  paddingBottom?: number
}

const verticalLineLabels: Array<LineLabel> = [
  {
    label: 'Genesis',
    date: "2020-07-30",
  },
  {
    label: ['WAGMI', 'PUP-11'],
    date: "2022-02-24",
  },
  {
    label: [ 'FREN', 'PUP-22'],
    date: "2022-08-29",
  },
  {
    label: ['SER', 'PUP-30'],
    date: "2023-02-24",
  },
  {
    label: ['ARR', 'PUP-32'],
    date: "2023-07-05",
  },
  {
    label: ['PIP-38', 'Start'],
    date: "2024-09-01",
    yAdjust: 20
  },
  {
    label: 'F-Chains',
    date: "2024-11-12",
    yAdjust: -4,
    paddingBottom: 4
  },
  {
    label: ['PIP-38', 'End'],
    date: "2025-02-17",
    yAdjust: 20
  },
  {
    label: 'Shannon : Mint=Burn',
    date: "2025-06-03T00:00:00.000Z",
    yAdjust: -4,
    xAdjust: 10,
    paddingBottom: 4
  },
]

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})

function getDays(time: Times) {
  switch (time) {
    case Times.Last24h:
      return 1
    case Times.Last7d:
      return 7
    case Times.Last30d:
      return 30
    case Times.Last60d:
      return 60
  }
}

function generateProjection(
  currentSupply: number,
  shannonSupply: Array<{
    "point": string
    "start_date": string
    "total_supply": number
  }>,
  currentTime: string,
  time: Times
) {
  const days = getDays(time)

  const startSupplyDate = getUtcStartOfDay(addDaysToUtc(currentTime, -days)).toISOString()

  const startSupply = shannonSupply.findLast((item) => item.start_date === startSupplyDate)?.total_supply || 0

  const grow1d = new Big(currentSupply).minus(startSupply).div(days)
  const supply2y = new Big(currentSupply).plus(grow1d.mul(365).mul(2))

  const projectedSupplyPerDay = new Big(supply2y).minus(currentSupply).div(365 * 2)

  const projectedData: Array<{
    point: string
    start_date: string
    total_supply: number
    projected: true
  }> = []


  for (let i = 1; i <= 365 * 2; i++) {
    const day = getUtcStartOfDay(addDaysToUtc(currentTime, i)).toISOString()
    projectedData.push({
      point: day,
      start_date: day,
      total_supply: supply2y.plus(projectedSupplyPerDay.mul(i)).toNumber(),
      projected: true
    })
  }

  return projectedData
}

interface ProcessedData {
  id: string
  point: string
  start_date: string
  total_supply: number
  projected?: boolean
}

function useSupplyProjectionData({
 selectedTime,
 initialError,
 initialCurrentSupply,
 initialShannonSupply,
 morseSupply,
}: ClientSupplyProjectionProps) {
  const {currentTime} = useHeightContext()
  const endOfDayCurrentTime = currentTime ? getUtcEndOfDay(currentTime).toISOString() : ''

  const shannonSupplyVariables = useCallback((_: number, timestamp: string) => {
    return getShannonSupplyVariables(timestamp)
    // eslint-disable-next-line
  }, [endOfDayCurrentTime])

  const {
    data: shannonSupply,
    error: errorShannonSupply,
    refetch: fetchShannonSupply,
    isLoading: loadingShannonSupply
  } = useFetchOnBlock({
    variables: shannonSupplyVariables,
    query: getTotalSupplyByDayDocument,
    initialError,
    initialResult: initialShannonSupply,
    skip: !!initialShannonSupply,
  })

  useDidMountEffect(() => {
    fetchShannonSupply()
  }, [shannonSupplyVariables])

  const variables = useCallback((_: number, timestamp: string) => {
    return getCurrentSupplyVariables(timestamp, selectedTime)
  }, [selectedTime])

  const {
    data: currentSupply,
    error: errorCurrentSupply,
    refetch: fetchCurrentSupply,
    isLoading: loadingCurrentSupply,
  } = useFetchOnBlock({
    query: currentSupplyDocument,
    initialError,
    initialResult: initialCurrentSupply,
    variables,
  })

  const isLoading = loadingCurrentSupply || loadingShannonSupply || (!shannonSupply && !errorShannonSupply) || (!currentSupply && !errorCurrentSupply)

  const processedData: Array<ProcessedData> = useMemo(() => {
    if (isLoading) return []

    const startOfCurrentDay = getUtcStartOfDay(currentTime).toISOString()

    const filledData = fillChartData({
      data: [
        ...(shannonSupply?.getTotalSupplyByDay?.map((item) => {
          const normalizedDay = normalizeIsoDate(item.day)

          return {
            id: normalizedDay,
            point: normalizedDay,
            start_date: normalizedDay,
            total_supply: item.total_supply
          }
        }) || []),
        {
          id: startOfCurrentDay,
          point: startOfCurrentDay,
          start_date: startOfCurrentDay,
          total_supply: currentSupply?.currentSupply?.total_supply || 0,
        }
      ],
      startDate: startDateMigration,
      endDate: endOfDayCurrentTime,
      defaultProps: {
        total_supply: 0
      },
      unitToFormatDate: 'day'
    })

    const realData = [
      ...morseSupply,
      ...filledData
    ]

    const projectedData = generateProjection(
      currentSupply?.currentSupply?.total_supply || 0,
      realData,
      endOfDayCurrentTime,
      selectedTime
    )

    return realData.concat(projectedData) as Array<ProcessedData>
    // eslint-disable-next-line
  }, [shannonSupply, currentSupply, morseSupply, selectedTime, isLoading,])

  return {
    isLoading,
    data: processedData,
    fetchCurrentSupply,
    fetchShannonSupply,
    errorCurrentSupply,
    errorShannonSupply,
  }
}

interface ClientSupplyProjectionProps {
  selectedTime: Times
  initialError: boolean
  initialCurrentSupply: DocumentNodeData<typeof currentSupplyDocument> | null
  initialShannonSupply: {
    getTotalSupplyByDay: Array<SupplyByDayItem>
  } | null
  morseSupply: Array<{
    "point": string
    "start_date": string
    "total_supply": number
  }>
}

export default function ClientSupplyProjection(props: ClientSupplyProjectionProps) {
  const {
    isLoading,
    data,
    fetchCurrentSupply,
    fetchShannonSupply,
    errorCurrentSupply,
    errorShannonSupply
  } = useSupplyProjectionData(props)


  if ((errorCurrentSupply || errorCurrentSupply) && !isLoading) {
    return (
      <div className={'flex grow items-center justify-center pb-12'}>
        <RetryError
          onRetry={() => {
            if (errorCurrentSupply) {
              fetchCurrentSupply()
            }

            if (errorShannonSupply) {
              fetchShannonSupply()
            }
          }}
        />
      </div>
    )
  }

  return (
    <div className={'h-[360px]'}>
      <BaseLineBarChart
        data={{
          '': data
        }}
        yAxisKey={'total_supply'}
        yAxisLabel={'POKTs'}
        lineColor={''}
        chartType={'line'}
        formatValueAxisY={(value) => isLoading ? value.toString() : formatUpokt({
          amount: value,
          includeSymbol: false,
        })}
        displayColorsInTooltip={true}
        getTooltipLabel={(item) => formatUpokt({
          amount: item.total_supply,
          includeSymbol: false,
          abbreviateThreshold: Number.MAX_SAFE_INTEGER,
          maxDecimals: 2,
        })}
        unitToFormatDate={'day'}
        isLoading={isLoading}
        getCustomDatasetProps={() => {
          const {bg, line, border} = {
            line: '#B7ABFF',
            bg: 'rgba(183, 171, 255, 0.1)',
            border: '#615A83'
          }

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
            segment: {
              borderDash: (context: ScriptableContext<'line'>) => {
                // eslint-disable-next-line
                // @ts-ignore
                return context.p1.raw.projected ? [10, 7] : undefined
              },
            }
          }
        }}
        customXAxisFormat={(item, index) => {
          const date = new Date(item.start_date)
          const year = date.getFullYear()

          const isFirstTick = index === 0
          const isLastTick = index === data.length - 1
          const isJanuary1st = date.getMonth() === 0 && date.getDate() === 1

          const areWeAfterJan1st = new Date().getMonth() > 0

          if (isFirstTick || (isLastTick && !areWeAfterJan1st) || isJanuary1st) {
            return year.toString()
          }

          return ''
        }}
        customOptions={{
          interaction: {
            mode: 'index',
            axis: 'x',
          },
          scales: {
            x: {
              ticks: {
                align: 'start',
                maxRotation: 0,
                autoSkip: false
              },
            },
            y: {
              grace: '60%'
            }
          },
          plugins: {
            tooltip: {
              titleMarginBottom: 10,
              footerMarginTop: 10,
              footerFont: {
                size: 10,
              },
              boxPadding: 6,
              footerColor: '#B8B8B8',
              callbacks: {
                title: function(tooltipItems: Array<TooltipItem<'bar'>>) {
                  const item = tooltipItems.at(0)?.raw as ProcessedData

                  return dateFormatter.format(new Date(item?.start_date || ''))
                },
                footer: function(tooltipItems: Array<TooltipItem<'bar'>>) {
                  const item = tooltipItems.at(0)?.raw as ProcessedData

                  return item?.projected ? 'PROJECTED' : undefined
                }
              }
            },
            ...(!isLoading && {
              annotation: {
                annotations: {
                  ...verticalLineLabels.reduce((acc, item, currentIndex) => ({
                    ...acc,
                    [`line${currentIndex+1}`]: {
                      type: 'line',
                      xMin: item.date,
                      xMax: item.date,
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      borderWidth: 1.5,
                      label: {
                        content: item.label,
                        position: 'end',
                        backgroundColor: '#1B1B1E',
                        color: 'white',
                        display: true,
                        padding: {
                          right: 6,
                          top: 6,
                          left: 6,
                          bottom: item.paddingBottom || 2,
                        },
                        xAdjust: item.xAdjust,
                        yAdjust: item.yAdjust,
                        font: {
                          size: 10,
                          weight: '600',
                          family: 'Inter',
                          lineHeight: '16px'
                        }
                      }
                    }
                  }), {}),
                }
              }
            })
          }
        }}
        beginAtZero={true}
        gradientColors={[]}
      />
    </div>
  )
}
