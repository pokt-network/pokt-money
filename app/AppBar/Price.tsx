'use client'
import usePrice from '@/hooks/usePrice'
import clsx from 'clsx'
import { formatAmount } from '@/utils/formatAmounts'

export default function Price() {
  const {usd, usd_24h_change} = usePrice()

  let symbol = ''

  if (usd_24h_change > 0) {
    symbol = '+'
  } else if (usd_24h_change < 0) {
    symbol = '-'
  }

  return (
    <div className={'h-[30px] font-medium tracking-wider bg-[color:var(--secondary-background)] px-2.5 flex flex-row items-center gap-2.5'}>
      <p className={'text-[10px]'}>
        <span className={'text-[color:var(--secondary-foreground)]'}>
          POKT Price:
        </span>{' '}
        ${formatAmount({
          amount: usd,
          maxDecimals: 5
        })}
      </p>
      <p
        className={
          clsx(
            'text-[10px]',
            usd_24h_change > 0 && 'text-[color:var(--success)]',
            usd_24h_change < 0 && 'text-[color:var(--error)]',
            usd_24h_change === 0 && 'text-[color:var(--secondary-foreground)]'
          )
        }
      >
        {usd_24h_change !== 0 && (
          <>
            <span>{symbol}</span>{' '}
          </>
        )}
        <span>
          {formatAmount({
            amount: Math.abs(usd_24h_change),
            maxDecimals: 2
          })}%
        </span>
      </p>
    </div>
  )
}
