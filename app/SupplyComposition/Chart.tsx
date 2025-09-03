'use client'
import type {Chart as ChartJs} from 'chart.js'
import Big from 'big.js'
import { useCallback, useMemo, useRef, useState } from 'react'
import { formatSimpleAmount, formatUpokt } from '@/utils/formatAmounts'
import { useSupplyComposition } from '@/context/supplyComposition'
import BaseLineBarChart from '@/components/BaseLineBarChart'
import { fillChartData, LineBarItem } from '@/utils/chart'
import RetryError from '@/components/ErrorRetry'
import { normalizeIsoDate } from '@/utils/dates'
import LegendItem from '@/components/LegendItem'

const colorsByLabel: Record<string, {line: string, bg: string, border: string}> = {
  'suppliers': {
    line: '#B7ABFF',
    bg: 'rgba(183, 171, 255, 0.1)',
    border: '#615A83'
  },
  'liquid': {
    line: '#00CF9D',
    bg: 'rgba(0, 207, 157, 0.1)',
    border: '#087059'
  },
  'wrapped': {
    line: '#FF72C7FF',
    bg: 'rgba(255,114,199,0.1)',
    border: '#935379',
  },
  'dao': {
    line: '#74B4FF',
    bg: 'rgba(116, 180, 255, 0.1)',
    border: '#42628A',
  },
  'apps': {
    line: '#FCFF74',
    bg: 'rgba(252, 255, 116, 0.1)',
    border: '#868844',
  },
  'unmigrated': {
    line: '#E95626',
    bg: 'rgba(233, 86, 38, 0.1)',
    border: '#7D331D',
  },
  'gateways': {
    line: '#FFA74F',
    bg: 'rgba(255, 167, 79, 0.1)',
    border: '#8F6233',
  },
  'validators': {
    line: '#9CFFFA',
    bg: 'rgba(156, 255, 250, 0.1)',
    border: '#4B7B78',
  }
}

const legendsItems = [
  {
    label: 'Liquid',
    boxColor: colorsByLabel.liquid.line,
  },
  {
    label: 'Unmigrated',
    boxColor: colorsByLabel.unmigrated.line,
  },
  {
    label: 'Suppliers',
    boxColor: colorsByLabel.suppliers.line,
  },
  {
    label: 'DAO',
    boxColor: colorsByLabel.dao.line,
  },
  {
    label: 'Wrapped',
    boxColor: colorsByLabel.wrapped.line,
  },
  {
    label: 'Validators',
    boxColor: colorsByLabel.validators.line,
  },
  {
    label: 'Apps',
    boxColor: colorsByLabel.apps.line,
  },
  {
    label: 'Gateways',
    boxColor: colorsByLabel.gateways.line,
  },
]

interface Item<T extends string> extends LineBarItem {
  id: T
  amount: number
  percentage: number
  start_date: string
  point: string
}

function getItem<T extends string>(id: T, total: number, amount: number, date: string): Item<T> {
  const normalizedDate = normalizeIsoDate(date)

  return {
    id,
    amount: amount || 0,
    percentage: total ? new Big(amount || 0).div(total).mul(100).toNumber() : 0,
    start_date: normalizedDate,
    point: normalizedDate,
  }
}

export default function SupplyCompositionChart() {
  const chartRef = useRef<ChartJs<'bar'>>(null)

  const {data, error, refetch, isLoading, lastVariables} = useSupplyComposition()

  const [hiddenDatasets, setHiddenDatasets] = useState<Array<number>>([])

  const onItemLegendClick = useCallback(
    (index: number) => {
      if (chartRef?.current) {
        const meta = chartRef.current.getDatasetMeta(index)

        meta.hidden = !meta.hidden

        if (meta.hidden) {
          setHiddenDatasets((prevState) => [...prevState, index])
        } else {
          setHiddenDatasets((prevState) => prevState.filter((value) => value !== index))
        }
        chartRef.current.update()
      }
    },
    []
  )

  const dataStr = useMemo(() => {
    if (!data) return ''

    return JSON.stringify(data)
  }, [data])

  const processedData = useMemo(() => {
    const suppliers: Array<Item<'suppliers'>> = [],
      apps: Array<Item<'apps'>> = [],
      gateways: Array<Item<'gateways'>> = [],
      unmigrated: Array<Item<'unmigrated'>> = [],
      wrapped: Array<Item<'wrapped'>> = [],
      validators: Array<Item<'validators'>> = [],
      liquid: Array<Item<'liquid'>> = [],
      dao: Array<Item<'dao'>> = []

    if (isLoading || !data) {
      return {
        suppliers,
        apps,
        gateways,
        validators,
        dao,
        liquid,
        wrapped,
        unmigrated,
      }
    }

    if (data?.supplyComposition?.length) {
      for (const item of data.supplyComposition) {
        let appsValue,
          suppliersValue, gatewaysValue, validatorsValue, daoValue, wrappedValue

        for (const {label, amount} of item.network_supply_composition) {
          switch (label) {
            case 'supplier': {
              suppliersValue = amount
              break
            }
            case 'application': {
              appsValue = amount
              break
            }
            case 'gateway': {
              gatewaysValue = amount
              break
            }
            case 'dao': {
              daoValue = amount
              break
            }
            case 'wrapped': {
              wrappedValue = amount
              break
            }
            case 'bonded_tokens_pool': {
              validatorsValue = amount
              break
            }
          }

          if ([
            appsValue,
            suppliersValue,
            gatewaysValue,
            validatorsValue,
            daoValue,
            wrappedValue
          ].every(v => typeof v !== 'undefined')) {
            break
          }
        }

        suppliers.push(getItem('suppliers', item.total_supply, suppliersValue, item.date_truncated))
        apps.push(getItem('apps', item.total_supply, appsValue, item.date_truncated))
        gateways.push(getItem('gateways', item.total_supply, gatewaysValue, item.date_truncated))
        validators.push(getItem('validators', item.total_supply, validatorsValue, item.date_truncated))
        dao.push(getItem('dao', item.total_supply, daoValue, item.date_truncated))
        unmigrated.push(getItem('unmigrated', item.total_supply, item.unmigrated_supply, item.date_truncated))
        wrapped.push(getItem('wrapped', item.total_supply, wrappedValue, item.date_truncated))

        const liquidValue = new Big(item.total_supply)
          .minus(suppliersValue || 0)
          .minus(appsValue || 0)
          .minus(gatewaysValue || 0)
          .minus(validatorsValue || 0)
          .minus(daoValue || 0)
          .minus(item.unmigrated_supply || 0)
          .toNumber()

        liquid.push(getItem('liquid', item.total_supply, liquidValue, item.date_truncated))
      }
    }

    function fillData<T extends string>(id: T, arr: Array<Item<T>>) {
      return fillChartData({
        data: arr,
        startDate: lastVariables?.startDate,
        endDate: lastVariables?.endDate,
        unitToFormatDate: lastVariables?.truncInterval === 'hour' ? 'hour' : 'day',
        defaultProps: {
          id,
          amount: 0,
          percentage: 0,
        }
      })
    }

    return {
      gateways: fillData('gateways', gateways),
      apps: fillData('apps', apps),
      validators: fillData('validators', validators),
      wrapped: fillData('wrapped', wrapped),
      dao: fillData('dao', dao),
      suppliers: fillData('suppliers', suppliers),
      unmigrated: fillData('unmigrated', unmigrated),
      liquid: fillData('liquid', liquid),
    }
  // eslint-disable-next-line
  }, [dataStr])

  const chart = useMemo(() => {
    return (
      <BaseLineBarChart
        ref={chartRef}
        data={processedData as Record<string, Array<Item<string>>>}
        yAxisKey={'amount'}
        yAxisLabel={'POKTs'}
        lineColor={''}
        chartType={'line'}
        formatValueAxisY={(value) => isLoading ? value.toString() : formatUpokt({
          amount: value,
          includeSymbol: false,
        })}
        displayColorsInTooltip={true}
        getTooltipLabel={(item) => formatUpokt({
          amount: item.amount,
          includeSymbol: false,
          abbreviateThreshold: Number.MAX_SAFE_INTEGER,
          maxDecimals: 2,
        }) + `   (${formatSimpleAmount(item.percentage.toFixed(2))}%)`}
        unitToFormatDate={lastVariables?.truncInterval === 'hour' ? 'hour' : 'day'}
        isLoading={isLoading}
        getCustomDatasetProps={(id) => {
          const {bg, line, border} = colorsByLabel[id] || {}
          return {
            stack: 1,
            fill: '-1',
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
                return (b.raw as Item<string>).amount - (a.raw as Item<string>).amount
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
      <div className={'flex flex-row flex-wrap gap-x-8 gap-y-2 pt-2 pb-6'}>
        {legendsItems.map((item, index) => {
          const datasetIndex = legendsItems.length - index - 1
          return (
            <LegendItem
              key={index}
              label={item.label}
              boxColor={hiddenDatasets.includes(datasetIndex) ? 'rgba(93, 93, 93, 0.5)' : item.boxColor}
              onClick={() => onItemLegendClick(datasetIndex)}
              loading={isLoading || (!data && !error)}
            />
          )
        })}
      </div>
      <div className={'h-[310px] pb-2 md:pb-0'}>
        {chart}
      </div>
    </>
  )
}
