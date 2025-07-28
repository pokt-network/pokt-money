'use client'

import useFetchOnBlock, { DocumentNodeData, ExtractVariables } from '@/hooks/useFetchOnBlock'
import { currentSupplyMintBurnDocument, getCurrentSupplyMintBurnVariables } from '@/Projection/operations'
import { Times } from '@/utils/dates'
import { useCallback, useMemo, useRef } from 'react'
import { convertUpoktToPokt } from '@/utils/formatAmounts'
import Big from 'big.js'
import ProjectionsLoader from '@/Projection/Loader'
import RetryError from '@/components/ErrorRetry'
import clsx from 'clsx'
import GaugeChart, { GaugeChartProps } from '@/Projection/GaugeChart'
import millify from 'millify'

function getPerYear(uPokt: number | string, daysDifference: number) {
  return convertUpoktToPokt(uPokt).mul(new Big(365).div(daysDifference)).toNumber()
}

interface ChartItemProps {
  title: string
  amountHelper: string
  value: number | string
  chartData: GaugeChartProps
  className?: string
}

function Item({className, title, amountHelper, chartData, value}: ChartItemProps) {
  return (
    <div className={clsx('h-full', className)}>
      <p className={'w-full font-light text-xs tracking-[0.5px] text-center'}>
        {title}
      </p>
      <div
        className={
          clsx(
            'flex flex-col grow items-center mt-2.5 md:mt-[38px] lg:mt-5 relative',
          )
        }
      >
        <div
          className={
            clsx(
              'flex relative',
              'w-[260px] xl:w-[300px]',
              'h-[170px] sm:h-[180px] lg:h-[198px] xl:h-[180px]',
            )
          }
        >
          <GaugeChart
            {...chartData}
            indexNeedle={chartData.indexNeedle || 0}
          />
        </div>
      </div>
      <div className={'flex flex-col z-[3] items-center bg-[color:var(--secondary-background)] h-[70px] -mt-2 xl:mt-0'}>
        <p
          className={
            'text-[20px] lg:text-[24px] font-medium leading-[24px] my-[3px]'
          }
        >
          {typeof value === 'string' ? value : millify(value, {precision: 2})}
        </p>
        <p className={'text-[color:var(--secondary-foreground)] text-xs lg:text-sm'}>
          {amountHelper}
        </p>
      </div>
    </div>
  )
}

interface ProjectionChartsProps {
  initialData: DocumentNodeData<typeof currentSupplyMintBurnDocument> | null
  initialError: boolean
  timeSelected: Times
  initialVariables: ExtractVariables<typeof currentSupplyMintBurnDocument> | null
}

export default function ProjectionCharts({
  initialError,
  initialData,
  timeSelected,
  initialVariables
}: ProjectionChartsProps) {
  const lastVariables = useRef<ExtractVariables<typeof currentSupplyMintBurnDocument>>(initialVariables)
  const variables = useCallback((_: number, timestamp: string) => {
    return lastVariables.current = getCurrentSupplyMintBurnVariables(timestamp, timeSelected)
  }, [timeSelected])

  const {data, refetch, error, isLoading} = useFetchOnBlock({
    initialError,
    initialResult: initialData,
    variables,
    query: currentSupplyMintBurnDocument,
  })

  const {burn, growth, issuance} = useMemo(() => {
    const {startDate, endDate} = lastVariables?.current || getCurrentSupplyMintBurnVariables(new Date().toISOString(), timeSelected)

    const daysDifference = (new Date(endDate).getTime() - new Date(startDate).getTime()) / (24 * 60 * 60 * 1000)

    const burned = getPerYear(data?.burn?.burn_mint || 0, daysDifference)
    const maxBurn = (burned * 5) / 3
    const burnData = [Math.min(burned, maxBurn), maxBurn - Math.min(burned, maxBurn)]

    const mint = (data?.mint?.inflation || 0) + (data?.mint?.mint_burn || 0)

    const issuance = getPerYear(
      mint,
      daysDifference
    )
    const maxIssuance = (issuance * 3) / 2
    const issuanceData = [
      Math.min(issuance, maxIssuance),
      maxIssuance - Math.min(issuance, maxIssuance),
    ]

    const growth = new Big(mint).minus(data?.burn?.burn_mint).mul(
      new Big(365).div(daysDifference)
    ).div(data?.supply?.total_supply).mul(100).toNumber()

    const growthNumber = (
      (((data?.mint?.total_mint - data?.burn?.burn_mint) * (365 / daysDifference)) / data?.supply?.total_supply) * 100
    )

    const growthData = [
      growth < 0 ? (growth > -25 ? 25 + growth : 0) : 25,
      Math.abs(growth),
      growth > 0 ? (growth < 25 ? 25 - growth : 0) : 25,
    ]

    return {
      burn: {
        value: burned,
        needleValue: burned,
        data: burnData,
        gradient: {
          x0: 50,
          colors: [
            {
              offset: 0,
              color: '#F7FC00',
            },
            {
              offset: 0.5,
              color: '#F4726A',
            },
          ],
        },
      },
      growth: {
        value: growth,
        data: growthData,
        needleValue:
          growth > 0 ? (growth > 25 ? 50 : growth + 25) : growth > -25 ? growthData[0] : 0.01,
        needleIndex: 1,
        gradient: {
          x0: growth > 0 ? 150 : 50,
          colors: [
            {
              offset: 0,
              color: '#F7FC00',
            },
            {
              offset: 0.5,
              color: '#F4726A',
            },
          ],
        },
      },
      issuance: {
        value: issuance,
        data: issuanceData,
        needleValue: issuance,
        gradient: {
          x0: 40,
          colors: [
            {
              offset: 0,
              color: 'rgba(255, 255, 255, 0.1)',
            },
            {
              offset: 0.5,
              color: '#1D8AED',
            },
          ],
        },
      },
    }
  }, [data, timeSelected])

  if (isLoading) {
    return (
      <ProjectionsLoader />
    )
  } else if (error) {
    return (
      <div className={'flex grow -mt-10 items-center justify-center col-span-3'}>
        <RetryError onRetry={refetch} />
      </div>
    )
  } else {
    return (
      <>
        <Item
          title={'BURN'}
          amountHelper={'POKT/Year'}
          chartData={burn}
          value={burn.value}
          className={'order-1 md:order-2 lg:order-1'}
        />
        <Item
          title={'SUPPLY GROWTH'}
          amountHelper={'Growth/Year'}
          chartData={growth}
          value={millify(growth.value, {precision: 2}) + '%'}
          className={'order-2 md:order-1 lg:order-2 md:col-span-2 lg:col-span-1'}
        />
        <Item
          title={'MINT'}
          amountHelper={'POKT/Year'}
          chartData={issuance}
          value={issuance.value}
          className={'order-3'}
        />
      </>
    )
  }
}
