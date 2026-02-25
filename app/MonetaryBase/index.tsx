import MonetaryBaseChart from '@/MonetaryBase/Chart'

export default function MonetaryBase() {
  return (
    <div className={'h-[336px] w-full xl:w-[calc(100%-406px)] bg-[color:var(--secondary-background)] px-4 rounded-md flex flex-col'}>
      <div className={'min-h-[50px] h-[50px] flex items-center'}>
        <h2>Circulating Supply</h2>
      </div>
      <MonetaryBaseChart />
    </div>
  )
}
