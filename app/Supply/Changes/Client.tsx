'use client'

import useFetchOnBlock, { DocumentNodeData } from "@/hooks/useFetchOnBlock";
import {
  getSupplyMintBurnAndChangesVariables,
  supplyMintBurnAndChangesDocument,
} from '../operations'
import { Times } from '@/utils/dates'
import React, { useCallback } from 'react'
import SupplyMintBurnLoader from '@/Supply/Changes/Loader'
import RetryError from '@/components/ErrorRetry'
import { formatUpokt } from '@/utils/formatAmounts'
import Big from 'big.js'
import clsx from 'clsx'
import { Minus, TrendingDown, TrendingUp } from 'lucide-react'

interface ChangeProps {
  previous: string | number
  current: string | number
  label: string
}

function Change({previous, current, label}: ChangeProps) {
  const diff = new Big(current).minus(previous)
  const changePercentage = Number(previous) === 0 ? new Big(100) : diff.div(previous).mul(100)

  let arrow: React.ReactNode = null

  if (diff.gt(0)) {
    arrow = (
      <TrendingUp className={'text-[color:var(--success)] w-3 h-4 rotate-[-10deg]'} />
    )
  } else if (diff.lt(0)) {
    arrow = (
      <TrendingDown className={'text-[color:var(--error)] w-3 h-4 rotate-[10deg]'} />
    )
  } else {
    arrow = (
      <Minus className={'text-[color:var(--secondary-foreground)] w-3 h-4'} />
    )
  }

  return (
    <div className={'flex gap-0.5 flex-col'}>
      <p
        className={'text-[13px] text-[color:var(--secondary-foreground)]'}
      >
        {label}
      </p>

      <div className={'flex flex-row gap-2 items-center'}>
        <p className={'text-[13px] font-medium'}>
          {formatUpokt({
            amount: current,
            includeSymbol: false,
            maxDecimals: 2
          })}
        </p>

        <div className={'flex flex-row items-center gap-1.5'}>
          <div
            className={
              clsx(
                'h-6 min-w-10 py-1 px-2 flex flex-row items-center justify-center rounded-full gap-1',
                diff.gt(0) && 'bg-[color:var(--success-background)]',
                diff.lt(0) && 'bg-[color:var(--error-background)]',
                diff.eq(0) && 'bg-gray-500/20'
              )
            }
          >
            <p
              className={
                clsx(
                  'text-xs font-semibold',
                  diff.gt(0) && 'text-[color:var(--success)]',
                  diff.lt(0) && 'text-[color:var(--error)]',
                  diff.eq(0) && 'text-[color:var(--secondary-foreground)]'
                )
              }
            >
              {Number(changePercentage.abs().toFixed(1))}%
            </p>
            {arrow}
          </div>
        </div>
      </div>
    </div>
  )
}

interface ClientSupplyMintBurnProps {
  initialData: DocumentNodeData<typeof supplyMintBurnAndChangesDocument> | null
  initialError: boolean
  selectedTime: Times
}

export default function ClientSupplyMintBurn({
  initialData,
  initialError,
  selectedTime
}: ClientSupplyMintBurnProps) {
  const variables = useCallback((_: number, timestamp: string) => {
    return getSupplyMintBurnAndChangesVariables(timestamp, selectedTime)
  }, [selectedTime])

  const {data, error, refetch, isLoading} = useFetchOnBlock({
    query: supplyMintBurnAndChangesDocument,
    variables,
    initialResult: initialData,
    initialError,
  })

  if (isLoading) {
    return <SupplyMintBurnLoader />
  } else if (error) {
    return (
      <RetryError
        onRetry={refetch}
      />
    )
  } else {
    let symbol: React.ReactNode = null
    const currentSupply = data?.currentSupply?.total_supply || 0
    const previousSupply = data?.previousSupply?.total_supply || 0

    const diff = new Big(currentSupply).minus(previousSupply)

    if (diff.gt(0)) {
      symbol = (
        <p className={'text-[color:var(--success)] font-bold text-2xl leading-[24px] -mr-2'}>
          +
        </p>
      )
    } else if (diff.lt(0)) {
      symbol = (
        <p className={'text-[color:var(--error)] font-bold text-2xl leading-[24px]'}>
          -
        </p>
      )
    }

    return (
      <div className={'-mt-[5px] xl:mt-3'}>
        <div className={'flex flex-row gap-2 items-center h-8 mb-1 pl-2 pb-2'}>
          {symbol}
          <p
            className={
              clsx(
                'text-2xl leading-[24px] font-bold',
                diff.gt(0) && 'text-[color:var(--success)]',
                diff.lt(0) && 'text-[color:var(--error)]',
                diff.eq(0) && 'text-[color:var(--secondary-foreground)]'
              )
            }
          >
            {formatUpokt({
              amount: diff.abs(),
              abbreviateThreshold: Number.MAX_SAFE_INTEGER,
              includeSymbol: false,
              maxDecimals: 2
            })}
          </p>
          <p className={'text-xl leading-[24px] font-light text-[color:var(--secondary-foreground)]'}>
            $POKT
          </p>
        </div>

        <hr className={'h-[1px] bg-[color:var(--border)] mt-3 xl:mt-5 mb-4 xl:mb-6'} />

        <div className={'-mt-[5px] flex-wrap xl:mt-4 flex flex-row items-center justify-between gap-2.5 pl-1 pr-0.5'}>
          <Change
            previous={data?.previousBurn?.burn_mint || 0}
            current={data?.currentBurn?.burn_mint || 0}
            label={'Burn'}
          />
          <Change
            previous={(data?.previousMint?.mint_burn || 0) + (data?.previousMint?.inflation || 0)}
            current={(data?.currentMint?.mint_burn || 0) + (data?.currentMint?.inflation || 0)}
            label={'Mint'}
          />
        </div>
      </div>
    )
  }
}
