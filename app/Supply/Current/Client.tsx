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
import { coveredMs, describePartialRange, normalizeGaps, NO_DATA_NOTE } from '@/utils/moneyRange'
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

  const { growthPerYear, rangeNote } = useMemo(() => {
    const range = data?.currentMintBurnRange
    const gaps = range ? normalizeGaps(range) : []
    const partial = describePartialRange(range, gaps)
    // Under the supply figure, say that the note is about the mint and burn behind the yearly rate.
    const note = partial && `Mint/burn: ${partial}`
    // The rate is never hidden without saying why (unless the note already says nothing is covered).
    const hidden = (why: string) => ({
      growthPerYear: null,
      rangeNote: partial === NO_DATA_NOTE ? note : note ? `${note}; ${why}` : why,
    })
    if (!data?.currentSupply?.total_supply) return { growthPerYear: null, rangeNote: note }
    if (!data.currentMint || !data.currentBurn) {
      // null mint or burn is unknown (getSupplyMetrics decides it)
      const uncovered = data.uncoveredFigures ?? []
      const which = uncovered.length === 1 ? uncovered[0] : 'mint/burn'
      return hidden(uncovered.length ? `no ${which} data for this range to annualise` : 'mint/burn unavailable, no yearly rate')
    }

    // With a range, mint and burn cover only part of the window, so they are annualised over the
    // covered time, and not at all when it is under half the window: a short slice would give an
    // extreme yearly rate.
    const fullWindowMs = new Date(data.endDate).getTime() - new Date(data.middleDate).getTime()
    const windowMs = range ? coveredMs(range, gaps) : fullWindowMs
    if (!(windowMs > 0) || windowMs < fullWindowMs / 2) {
      return hidden(range ? 'not enough covered data to annualise' : 'window too short to annualise')
    }
    const daysDifference = windowMs / (24 * 60 * 60 * 1000)

    const mint = (data.currentMint.inflation || 0) + (data.currentMint.mint_burn || 0)
    const burn = data.currentBurn.burn_mint || 0

    return {
      growthPerYear: new Big(mint).minus(burn)
        .mul(new Big(365).div(daysDifference))
        .div(data.currentSupply.total_supply)
        .mul(100)
        .toNumber(),
      rangeNote: note,
    }
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
        {rangeNote && (
          <p className={'w-full text-[11px] text-[color:var(--secondary-foreground)]'}>
            {rangeNote}
          </p>
        )}
      </div>
    )
  }
}
