import { Times } from '@/utils/dates'
import ClientCUTTMEvolution from '@/CUTTMEvolution/Client'

interface CUTTMEvolutionProps {
  selectedTime: Times
}

export default function CUTTMEvolution({ selectedTime }: CUTTMEvolutionProps) {
  return (
    <div className={'min-h-[420px] w-full bg-[color:var(--secondary-background)] px-4 rounded-md flex flex-col'}>
      <div className={'h-[50px] flex items-center'}>
        <h2>CUTTM Evolution</h2>
      </div>
      <ClientCUTTMEvolution selectedTime={selectedTime} />
    </div>
  )
}
