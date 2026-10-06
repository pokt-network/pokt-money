'use client'

import { useFetchOnBlockCore } from "@/hooks/useFetchOnBlock";
import { fetchSupplyMetrics } from '@/Supply/fetchSupplyMetrics'
import type { SupplyMetrics } from '@/Supply/types'
import { Times } from '@/utils/dates'
import React, { useMemo } from 'react'
import SupplyMintBurnLoader from '@/Supply/Changes/Loader'
import RetryError from '@/components/ErrorRetry'
import { formatUpokt } from '@/utils/formatAmounts'
import { describePartialRange, NO_DATA_NOTE } from '@/utils/moneyRange'
import Big from 'big.js'
import clsx from 'clsx'

interface ChangeProps {
  // null: nothing in the range is covered
  current: string | number | null
  label: string
}

function Change({current, label}: ChangeProps) {
  return (
    <div className={'flex gap-0.5 flex-col'}>
      <p className={'text-[11px] text-[color:var(--secondary-foreground)]'}>
        {label}
      </p>
      <p className={'text-xs font-medium'}>
        {current === null ? '-' : formatUpokt({
          amount: current,
          includeSymbol: false,
          maxDecimals: 2
        })}
      </p>
    </div>
  )
}

interface ClientSupplyMintBurnProps {
  initialData: SupplyMetrics | null
  initialError: boolean
  selectedTime: Times
}

export default function ClientSupplyMintBurn({
  initialData,
  initialError,
  selectedTime
}: ClientSupplyMintBurnProps) {
  // Refreshes on every block through our own route handler, which serves the server-side cache
  // instead of re-running the indexer aggregates.
  const {data, error, refetch, isLoading} = useFetchOnBlockCore({
    fetcher: fetchSupplyMetrics,
    variables: selectedTime,
    initialResult: initialData,
    initialError,
  })

  // The range note describes the figures shown; an unknown one gets its own line, in display order,
  // unless both are unknown and the range note already says so.
  const notes = useMemo(() => {
    const rangeNote = describePartialRange(data?.currentMintBurnRange)
    const uncovered = data?.uncoveredFigures ?? []
    const unknown = rangeNote === NO_DATA_NOTE ? [] : (['burn', 'mint'] as const)
      .filter((figure) => uncovered.includes(figure))
      .map((figure) => `${figure === 'mint' ? 'Mint' : 'Burn'}: ${NO_DATA_NOTE.toLowerCase()}`)
    return [...(rangeNote ? [rangeNote] : []), ...unknown]
  }, [data])

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
          {/* null mint or burn is unknown (getSupplyMetrics decides it), which must not read as 0 */}
          <Change
            current={data?.currentBurn ? data.currentBurn.burn_mint || 0 : null}
            label={'Burn'}
          />
          <Change
            current={data?.currentMint ? (data.currentMint.mint_burn || 0) + (data.currentMint.inflation || 0) : null}
            label={'Mint'}
          />
        </div>
        {notes.map((note) => (
          <p key={note} className={'w-full -mt-3 text-[11px] text-[color:var(--secondary-foreground)]'}>
            {note}
          </p>
        ))}
      </div>
    )
  }
}
