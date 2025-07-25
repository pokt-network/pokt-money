'use client'

import useFetchOnBlock, { DocumentNodeData } from "@/hooks/useFetchOnBlock";
import {
  currentSupplyDocument,
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

interface ChangeProps {
  previous: string | number
  current: string | number
  label: string
}

function Change({previous, current, label}: ChangeProps) {
  const diff = new Big(current).minus(previous)
  const changePercentage = diff.div(previous).mul(100)

  return (
    <div className={'flex flex-row gap-2.5 items-center'}>
      <p className={'text-xs'}>
        {formatUpokt({
          amount: current,
          includeSymbol: false
        })}
      </p>

      <div
        className={
          clsx(
            'h-4 min-w-10',
            diff.gt(0) && 'bg-[color:var(--success)]',
            diff.lt(0) && 'bg-[color:var(--error)]',
            diff.eq(0) && 'bg-[color:var(--secondary-foreground)]'
          )
        }
      >
        {changePercentage.toFixed(1)}%
      </div>

      <p
        className={'font-light text-xs text-[color:var(--secondary-foreground)]'}
      >
        {label}
      </p>
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
        <p className={'text-[color:var(--success)] text-2xl leading-[24px] -mr-2'}>
          +
        </p>
      )
    } else if (diff.lt(0)) {
      symbol = (
        <p className={'text-[color:var(--error)] text-2xl leading-[24px]'}>
          -
        </p>
      )
    }

    return (
      <div className={'mt-4'}>
        <div className={'flex flex-row gap-2.5 items-center h-10 pl-5'}>
          {symbol}
          <p className={'text-2xl leading-[24px]'}>
            {formatUpokt({
              amount: diff.abs(),
              abbreviateThreshold: Number.MAX_SAFE_INTEGER,
              includeSymbol: false,
              maxDecimals: 2
            })}
          </p>
          <p className={'text-2xl leading-[24px] font-light text-[color:var(--secondary-foreground)]'}>
            $POKT
          </p>
        </div>
        <div className={'border mt-6 border-[color:var(--border)] px-5 flex flex-row items-center justify-between gap-2.5 h-[50px]'}>
          <Change
            previous={data?.previousBurn?.total_burn || 0}
            current={data?.previousBurn?.total_burn || 0}
          />
        </div>
      </div>
    )
  }


}
