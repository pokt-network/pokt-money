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

interface ChangeProps {
  current: string | number
  label: string
}

function Change({current, label}: ChangeProps) {
  return (
    <div className={'flex gap-0.5 flex-col'}>
      <p className={'text-[11px] text-[color:var(--secondary-foreground)]'}>
        {label}
      </p>
      <p className={'text-xs font-medium'}>
        {formatUpokt({
          amount: current,
          includeSymbol: false,
          maxDecimals: 2
        })}
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
      <div className={'mt-2 flex flex-row flex-wrap gap-x-4 gap-y-5 items-center pl-2'}>
        <div className={'flex flex-row gap-2 items-center'}>
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

        <div className={'flex flex-row items-center gap-4 -mt-3'}>
          <Change
            current={data?.currentBurn?.burn_mint || 0}
            label={'Burn'}
          />
          <Change
            current={(data?.currentMint?.mint_burn || 0) + (data?.currentMint?.inflation || 0)}
            label={'Mint'}
          />
        </div>
      </div>
    )
  }
}
