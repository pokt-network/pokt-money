import Link from 'next/link'
import clsx from 'clsx'
import { timeKey } from '@/constants'
import { Times } from '@/utils/dates'

const labelByTime: Record<Times, string> = {
  last24h: '1d',
  last7d: '7d',
  last30d: '30d',
  last365d: '365d',
}

interface TimeSelectorProps {
  selectedTime: Times
}

export default function TimeSelector({selectedTime}: TimeSelectorProps) {
  return (
    <div className={'flex flex-row items-center gap-2.5 w-full md:w-[270px]'}>
      <label className={'text-xs tracking-[1px]'}>
        Time
      </label>

      <div
        className={'w-full md:w-[227px] border border-[color:var(--border)] rounded-2xl flex flex-row items-center p-[5px] gap-[5px]'}
      >
        {Object.values(Times).map((time) => (
          <Link
            key={time}
            href={`/?${timeKey}=${time}`}
            prefetch={false}
            className={
              clsx(
                'text-xs w-full md:w-[50px] h-[20px] text-center leading-[20px] tracking-[1px] font-medium',
                time !== selectedTime && 'text-[color:var(--secondary-v2-foreground)]',
                time === selectedTime && 'bg-white rounded-2xl text-[color:var(--main-background)]'
              )
            }
          >
            {labelByTime[time] || time}
          </Link>
        ))}
      </div>
    </div>
  )
}
