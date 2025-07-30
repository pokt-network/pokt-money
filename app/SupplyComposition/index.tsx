import SupplyCompositionChart from '@/SupplyComposition/Chart'

export default function SupplyComposition() {
  return (
    <div className={'min-h-[420px] w-full bg-[color:var(--secondary-background)] px-4 rounded-md flex flex-col'}>
      <div className={'h-[50px] flex items-center'}>
        <h2>Supply Composition</h2>
      </div>
      <SupplyCompositionChart />
    </div>
  )
}
