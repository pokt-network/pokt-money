import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

interface ChangeLoaderProps {
  title: string
}

function ChangeLoader({title}: ChangeLoaderProps) {
  return (
    <div className={'flex flex-col gap-0.5'}>
      <p
        className={'text-[13px] text-[color:var(--secondary-foreground)]'}
      >
        {title}
      </p>
      <div className={'flex flex-row gap-2 items-center'}>
        <Skeleton className={'h-5 w-[80px]'} />
        <Skeleton className={'h-6 w-[70px] rounded-full'} />
      </div>
    </div>
  )
}

export default function SupplyMintBurnLoader() {
  return (
    <div>
      <Skeleton className={'h-6 mb-2 xl:mb-0 xl:h-8 w-[200px] ml-1.5 -mt-[5px] xl:mt-3'} />
      <hr className={'h-[1px] bg-[color:var(--border)] mt-5 xl:mt-5 mb-4 xl:mb-6'} />

      <div className={'-mt-[5px] flex-wrap xl:mt-4 flex flex-row items-center justify-between gap-2.5 pl-1 pr-0.5'}>
        <ChangeLoader title={'Burn'} />
        <ChangeLoader title={'Mint'} />
      </div>
    </div>
  )
}
