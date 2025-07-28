import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

interface ChangeLoaderProps {
  title: string
}

function ChangeLoader({title}: ChangeLoaderProps) {
  return (
    <div className={'flex flex-col gap-1'}>
      <p
        className={'text-[13px] text-[color:var(--secondary-foreground)]'}
      >
        {title}
      </p>
      <Skeleton className={'h-5 w-[80px]'} />
      <Skeleton className={'h-6 w-[70px] rounded-full'} />
    </div>
  )
}

export default function SupplyMintBurnLoader() {
  return (
    <div>
      <Skeleton className={'h-6 mb-2 xl:mb-0 xl:h-8 w-[200px] ml-1.5 -mt-[5px] xl:mt-3'} />

      <div className={'-mt-[5px] flex-wrap xl:mt-4 flex flex-row items-center justify-between gap-2.5'}>
        <ChangeLoader title={'Burn'} />
        <ChangeLoader title={'Mint'} />
        <ChangeLoader title={'Inflation'} />
      </div>
    </div>
  )
}
