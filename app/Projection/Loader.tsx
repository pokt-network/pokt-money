import { Skeleton } from '@/components/ui/skeleton'
import clsx from 'clsx'

interface GaugeSkeletonProps {
  className?: string
}

function GaugeSkeleton({className}: GaugeSkeletonProps) {
  return (
    <div
      className={
        clsx(
          'relative flex grow items-center justify-center z-[1]',
          className
        )
      }
    >
      <div className={
        clsx(
          'flex flex-col relative items-center',
          'w-[220px] xl:w-[300px]',
          'h-[160px] xl:h-[170px]',
          'min-h-[160px] xl:min-h-[170px]',
        )
      }>
        <div
          className={
            clsx(
              'h-[260px] items-center',
              'min-h-[260px]',
              'w-[260px]',
            )
          }
        >
          <Skeleton className={'h-full w-full rounded-full'} />
        </div>
        <div
          className={
            clsx(
              'absolute flex self-center rounded-full top-[30px] bg-[color:var(--secondary-background)]',
              'h-[200px]',
              'w-[200px]',
            )
          }
        />
      </div>
    </div>
  )
}


interface ChartLoaderItemProps {
  title: string
  amountHelper: string
  gaugeClassName?: string
}

function ChartLoaderItem({title, amountHelper, gaugeClassName}: ChartLoaderItemProps) {
  return (
    <div
      className={
        clsx(
          'flex h-full flex-col w-full',
          gaugeClassName
        )
      }
    >
      <p className={'w-full font-light text-xs tracking-[0.5px] text-center'}>
        {title}
      </p>
      <div
        className={
          clsx(
            'flex grow items-center mt-[5px] md:mt-5 relative',
          )
        }
      >
        <GaugeSkeleton />
      </div>
      <div className={'flex flex-col w-[300px] md:w-auto z-[3] items-center bg-[color:var(--secondary-background)] h-[120px] -mt-7 pt-5'}>
        <Skeleton className={'w-[120px] h-[30px]'} />
        <p className={'text-[color:var(--secondary-foreground)] text-xs lg:text-sm'}>
          {amountHelper}
        </p>
      </div>
    </div>
  )
}

export default function ProjectionsLoader() {
  return (
    <>
      <ChartLoaderItem
        title={'BURN'}
        amountHelper={'POKT/Year'}
        gaugeClassName={'order-1  md:order-2 lg:order-1'}
      />
      <ChartLoaderItem
        title={'SUPPLY GROWTH'}
        amountHelper={'Growth/Year'}
        gaugeClassName={'order-2 md:order-1 lg:order-2 md:col-span-2 lg:col-span-1'}
      />
      <ChartLoaderItem
        title={'MINT'}
        amountHelper={'POKT/Year'}
        gaugeClassName={'order-3'}
      />
    </>
  )
}
