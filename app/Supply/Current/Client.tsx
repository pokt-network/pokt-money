'use client'
import useFetchOnBlock, { DocumentNodeData } from '@/hooks/useFetchOnBlock'
import { currentSupplyDocument, getCurrentSupplyVariables } from '@/Supply/operations'
import { Times } from '@/utils/dates'
import { useCallback } from 'react'
import { formatUpokt } from '@/utils/formatAmounts'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

interface ClientCurrentSupplyProps {
  initialData: DocumentNodeData<typeof currentSupplyDocument> | null
  initialError: boolean
  selectedTime: Times
}

export default function ClientCurrentSupply({
  initialError,
  initialData,
  selectedTime,
}: ClientCurrentSupplyProps) {
  const variables = useCallback((_: number, timestamp: string) => {
    return getCurrentSupplyVariables(timestamp, selectedTime)
  }, [selectedTime])

  const {data, error, refetch, isLoading} = useFetchOnBlock({
    query: currentSupplyDocument,
    variables,
    initialResult: initialData,
    initialError,
  })

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
      <div className={'flex flex-row gap-2.5 items-center h-10'}>
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
    )

  }

}
