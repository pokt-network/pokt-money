'use client'
import MonetaryBaseChart from '@/MonetaryBase/Chart'

export default function MonetaryBase() {
  return (
    <div className={'h-[360px] w-full xl:w-2/3 bg-[color:var(--secondary-background)] px-4 rounded-md flex flex-col'}>
      <div className={'h-[50px] flex items-center'}>
        <h2>Monetary Base</h2>
      </div>
      <MonetaryBaseChart />
    </div>
  )
}
