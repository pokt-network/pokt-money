'use client'
import { useFetchOnBlockCore } from '@/hooks/useFetchOnBlock'
import { fetchSupplyMetrics } from '@/Supply/fetchSupplyMetrics'
import type { SupplyMetrics } from '@/Supply/types'
import { Times } from '@/utils/dates'
import { useMemo } from 'react'
import { formatUpokt } from '@/utils/formatAmounts'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import Big from 'big.js'
import clsx from 'clsx'

interface ClientCurrentSupplyProps {
  initialData: SupplyMetrics | null
  initialError: boolean
  selectedTime: Times
}

export default function ClientCurrentSupply({
  initialError,
  initialData,
  selectedTime,
}: ClientCurrentSupplyProps) {
  // Refreshes on every block through our own route handler, which serves the server-side cache
  // instead of re-running the indexer aggregates.
  const {data, error, refetch, isLoading} = useFetchOnBlockCore({
    fetcher: fetchSupplyMetrics,
    variables: selectedTime,
    initialResult: initialData,
    initialError,
  })

  const growthPerYear = useMemo(() => {
    if (!data?.currentSupply?.total_supply) return null

    const daysDifference = (new Date(data.endDate).getTime() - new Date(data.middleDate).getTime()) / (24 * 60 * 60 * 1000)

    const mint = (data.currentMint?.inflation || 0) + (data.currentMint?.mint_burn || 0)
    const burn = data.currentBurn?.burn_mint || 0

    return new Big(mint).minus(burn)
      .mul(new Big(365).div(daysDifference))
      .div(data.currentSupply.total_supply)
      .mul(100)
      .toNumber()
  }, [data])

  if (isLoading) {
    return (
      <Skeleton className={'mt-4 h-7 w-[300px]'} />
    )
  } else if (error) {
    return (
      <div className={'flex flex-row gap-3 items-center h-10'}>
        <p
          className={'text-[color:var(--error)] text-sm font-medium]'}
        >
          Error loading Supply
        </p>
        <Button
          onClick={refetch}
          variant={'outline'}
          className={'h-[26px] text-[13px] cursor-pointer'}
        >
          Retry
        </Button>
      </div>
    )
  } else {
    return (
      <div className={'flex flex-row flex-wrap gap-x-2.5 gap-y-2 items-center mt-2'}>
        <div className={'flex flex-row gap-2.5 items-center'}>
          <p className={'text-2xl leading-[24px]'}>
            {formatUpokt({
              amount: data?.currentSupply?.total_supply || 0,
              abbreviateThreshold: Number.MAX_SAFE_INTEGER,
              includeSymbol: false,
              maxDecimals: 2
            })}
          </p>
          <p className={'text-2xl leading-[24px] font-light text-[color:var(--secondary-foreground)]'}>
            $POKT
          </p>
        </div>
        {growthPerYear !== null && (
          <span
            className={clsx(
              'text-sm font-medium',
              growthPerYear > 0 && 'text-[color:var(--success)]',
              growthPerYear < 0 && 'text-[color:var(--error)]',
              growthPerYear === 0 && 'text-[color:var(--secondary-foreground)]',
            )}
          >
            {growthPerYear > 0 ? '+' : ''}{growthPerYear.toFixed(2)}%/yr
          </span>
        )}
      </div>
    )
  }
}
