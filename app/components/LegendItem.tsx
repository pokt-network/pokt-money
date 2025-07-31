import { Skeleton } from '@/components/ui/skeleton'

interface LegendItemProps {
  label: string
  boxColor: string
  onClick?: () => void
  loading: boolean
}

export default function LegendItem({label, boxColor, onClick, loading}: LegendItemProps) {
  if (loading) {
    return(
      <Skeleton className={'h-5 w-20'} />
    )
  }

  return (
    <div
      className={'flex items-center cursor-pointer gap-2'}
      onClick={onClick}
    >
      <div
        className={'w-3 h-3 rounded-[1px]'}
        style={{backgroundColor: boxColor}}
      />
      <p
        className={'text-[color:var(--secondary-v2-foreground)] font-medium whitespace-nowrap text-right select-none text-[11px] lg:text-xs'}
      >
        {label}
      </p>
    </div>
  )
}
