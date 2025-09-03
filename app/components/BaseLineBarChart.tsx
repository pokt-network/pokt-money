'use client'
import type {
  ChartOptions,
  Chart as ChartJs,
  ScriptableContext,
  ChartData,
  TooltipItem
} from 'chart.js'
import merge from 'lodash/merge'
import { Chart } from 'react-chartjs-2'
import React, { useEffect, useState } from 'react'
import { formatSimpleAmount } from '@/utils/formatAmounts'
import { formatDate, UnitTimeGroup } from '@/utils/dates'
import {
  ChartLoaderConfigProps,
  getChartLoaderConfig,
  getCommonChartLoaderOptions,
  LineBarItem,
} from '@/utils/chart'
import annotationPlugin from 'chartjs-plugin-annotation'

interface BaseLineBarChartProps<T extends LineBarItem> {
  chartType?: 'line' | 'bar'
  data: Record<string, Array<T>>
  yAxisKey: keyof T
  yAxisLabel: string
  lineColor: string
  chartTitle?: string
  colorById?: Record<string, string>
  getTooltipLabel?: (data: T) => string | Array<string> | undefined
  unitToFormatDate?: UnitTimeGroup
  isLoading?: boolean
  customOptions?: Partial<ChartOptions>
  customDataLoaderProps?: Partial<ChartLoaderConfigProps>
  formatValueAxisY?: (value: string | number) => string
  displayColorsInTooltip?: boolean
  beginAtZero?: boolean
  gradientColors?: Array<GradientColor>
  getCustomDatasetProps?: (id: string) => object
  ref?: React.RefObject<ChartJs<'bar'> | null>
  customXAxisFormat?: (item: T, index: number) => string
}

export interface GradientColor {
  offset: number
  color: string
}

const defaultGradientColors: Array<GradientColor> = [
  {
    offset: 0.6053,
    color: 'rgba(0, 207, 157, 0.1)',
  },
  {
    offset: 0.9032,
    color: 'rgba(0, 207, 157, 0)',
  },
]

export default function BaseLineBarChart<T extends LineBarItem>({
  data,
  colorById,
  chartType = 'line',
  yAxisKey,
  yAxisLabel,
  unitToFormatDate = 'day',
  getTooltipLabel,
  isLoading = false,
  customOptions,
  customDataLoaderProps,
  formatValueAxisY,
  displayColorsInTooltip = true,
  chartTitle,
  beginAtZero,
  gradientColors = defaultGradientColors,
  lineColor,
  getCustomDatasetProps,
  ref,
  customXAxisFormat,
}: BaseLineBarChartProps<T>) {
    const [colors, setColors] = useState({
      primary: '',
      skeleton: '',
      secondary: '',
    })

    useEffect(() => {
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          const style = window.getComputedStyle(document.body)

          setColors({
            primary: style.getPropertyValue('--primary'),
            skeleton: style.getPropertyValue('--border'),
            secondary: style.getPropertyValue('--secondary-foreground'),
          })
        }
      }, 0)
    }, [])

    const dataEntries = Object.entries(data)

    const chartData = isLoading
      ? getChartLoaderConfig({
        length: 30,
        xAxisKey: 'point',
        yAxisKey: yAxisKey.toString(),
        chartType: chartType,
        randomValues: true,
        datasetProps: {
          beginAtZero: true,
          fill: true,
          tension: 0,
          borderWidth: 1.5,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 1,
          pointBackgroundColor: lineColor,
          backgroundColor: 'rgba(39, 39, 39, 0.5)',
        },
        ...customDataLoaderProps,
      }) : {
        labels: [],
        datasets: dataEntries.map(([id, items], index) => {
          const color = colorById?.[id]

          const baseProps = {
            type: chartType,
            data: items,
            backgroundColor: color || lineColor,
            order: index + 1,
          }

          if (chartType === 'line') {
            return {
              ...baseProps,
              pointHoverRadius: 4,
              borderColor: color || lineColor,
              fill: true,
              backgroundColor: (context: ScriptableContext<'bar'>) => {
                if (!context.chart.chartArea) {
                  return
                }
                const {
                  ctx,
                  chartArea: { top, bottom },
                } = context.chart

                const gradientBg = ctx.createLinearGradient(0, top, 0, bottom)
                for (const item of gradientColors) {
                  gradientBg.addColorStop(item.offset, item.color)
                }
                return gradientBg
              },
              tension: 0,
              borderWidth: 1.5,
              pointRadius: 0,
              pointHoverBorderWidth: 1,
              pointBackgroundColor: color || lineColor,
              pointBorderColor: '#101014',
              ...(getCustomDatasetProps?.(id) || {}),
            }
          }

          if (chartType === 'bar') {
            return {
              ...baseProps,
              barPercentage: 1,
            }
          }
        })
      }

    let options: object = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
      },
      spanGaps: true,
      parsing: {
        xAxisKey: 'point',
        yAxisKey: yAxisKey,
      },
      scales: {
        x: {
          ticks: {
            font: {
              size: 10,
              weight: '500',
              family: 'Inter',
              style: 'normal',
            },
            color: colors.secondary,
            callback: function(value: number, index: number) {
              if (isLoading && chartData.labels.length > 0) {
                return chartData.labels[value]
              }

              if (customXAxisFormat) {
                return customXAxisFormat(dataEntries[0][1][value], index)
              }

              const date = formatDate(dataEntries[0][1][value]?.point, unitToFormatDate, true)

              return unitToFormatDate === 'day' ? date : date.split(' ').at(-1)
            }
          },
          grid: {
            display: false
          },
        },
        y: {
          grace: '20%',
          title: {
            display: !!yAxisLabel,
            text: yAxisLabel,
            color: '#FFF',
            font: {
              weight: '500',
              size: 12,
              family: 'Inter',
            },
          },
          ticks: {
            font: {
              size: 10,
              weight: '500',
              style: 'normal',
              family: 'Inter',
            },
            color: colors.secondary,
            callback: function (value: string | number) {
              if (formatValueAxisY) {
                return formatValueAxisY(value)
              }
              return formatSimpleAmount(value)
            }
          },
          grid: {
            display: true,
            drawBorder: false,
            color: colors.skeleton,
            borderColor: colors.skeleton,
            tickColor: 'transparent',
            tickLength: 6,
          },
          beginAtZero: beginAtZero || isLoading,
        }
      },
      plugins: {
        title: {
          display: !!chartTitle,
          text: chartTitle,
          color: '#B8B8B8',
          font: {
            size: 12,
            family: 'Inter',
            weight: '400',
            style: 'normal',
          },
          padding: {
            bottom: 20,
          },
        },
        legend: {
          position: 'top',
          align: 'end',
          boxWidth: 12,
          boxHeight: 12,
          display: false,
          font: {
            size: 10,
            family: 'Inter',
            weight: '400',
            style: 'normal',
          },
        },
        tooltip: {
          mode: chartType === 'bar' ? 'point' :'nearest',
          intersect: false,
          displayColors: displayColorsInTooltip,
          caretSize: 8,
          bodySpacing: 12,
          boxPadding: 10,
          clip: false,
          bodyColor: '#dddddd',
          bodyFont: {
            size: 14,
            weight: '600',
            fontFamily: 'Inter',
          },
          titleFont: {
            size: 14,
            weight: 'bold',
            fontFamily: 'Inter',
          },
          boxWidth: 12,
          boxHeight: 12,
          titleColor: colors.primary,
          padding: 10,
          callbacks: {
            title: function(tooltipItems: Array<TooltipItem<'bar'>>) {
              const date = formatDate(tooltipItems.at(0)?.label || '', unitToFormatDate === 'day' ? 'day' : 'hour', unitToFormatDate === 'day')
              return unitToFormatDate === 'day' ? date : date + 'h'
            },
            label: function(context: TooltipItem<'bar'>) {
              const data = context.dataset.data[context.dataIndex] as unknown as T

              return getTooltipLabel ? getTooltipLabel(data) : context.label
            },
          }
        },
      },
      animations: undefined,
      events: undefined,
    }

    if (isLoading) {
      options = merge(
        options,
        getCommonChartLoaderOptions({
          isLight: false,
          chartType,
          from: colors.skeleton,
        })
      )
    }

    if (customOptions) {
      options = merge(options, customOptions)
    }


    return (
      <Chart
        ref={ref}
        type={'bar'}
        data={chartData as unknown as ChartData<'bar'>}
        redraw={false}
        options={options}
        plugins={[annotationPlugin]}
      />
    )
  }

