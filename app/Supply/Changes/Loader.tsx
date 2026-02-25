import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

function ChangeLoader({title}: {title: string}) {
  return (
    <div className={'flex flex-col gap-0.5'}>
      <p className={'text-[11px] text-[color:var(--secondary-foreground)]'}>
        {title}
      </p>
      <Skeleton className={'h-4 w-[80px]'} />
    </div>
  )
}

export default function SupplyMintBurnLoader() {
  return (
    <div className={'mt-2 flex flex-row flex-wrap gap-x-4 gap-y-5 items-center pl-2'}>
      <Skeleton className={'h-8 w-[200px]'} />
      <div className={'flex flex-row items-center gap-4'}>
        <ChangeLoader title={'Burn'} />
        <ChangeLoader title={'Mint'} />
      </div>
    </div>
  )
}
