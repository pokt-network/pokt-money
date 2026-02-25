import MonetaryBaseChart from '@/MonetaryBase/Chart'

export default function MonetaryBase() {
  return (
    <div className={'h-[360px] w-full bg-[color:var(--secondary-background)] px-4 rounded-md flex flex-col'}>
      <div className={'min-h-[50px] h-[50px] flex items-center'}>
        <h2>Circulating Supply</h2>
      </div>
      <MonetaryBaseChart />
    </div>
  )
}
