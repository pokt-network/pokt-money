import { Skeleton } from '@/components/ui/skeleton'

export default function SupplyMintBurnLoader() {
  return (
    <div className={'mt-4'}>
      <Skeleton className={'h-7 w-[350px] ml-5'} />

      <div className={'border mt-6 border-[color:var(--border)] px-5 flex flex-row items-center justify-between gap-2.5 h-[50px]'}>
        <Skeleton className={'h-5 w-[100px]'} />
        <Skeleton className={'h-5 w-[100px]'} />
      </div>
    </div>
  )
}
