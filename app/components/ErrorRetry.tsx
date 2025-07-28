import { Button } from '@/components/ui/button'
import { CircleX } from 'lucide-react'

interface BaseRetryErrorProps {
  onRetry?: () => void
  errorMessage?: string
}

export default function RetryError({
 onRetry,
 errorMessage = "Oops. There was an error loading the data."
}: BaseRetryErrorProps) {
  return (
    <div className="grow flex flex-col justify-center items-center">
      <CircleX className="text-[color:var(--error)] mb-2 h-8 w-8" />
      <p className="tracking-wide  text-sm text-center">{errorMessage}</p>
      <Button onClick={onRetry} className={'h-[26px] mt-2 cursor-pointer'}>
        Retry
      </Button>
    </div>
  )
}
