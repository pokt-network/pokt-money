import useFetchOnBlock, { DocumentNodeData, ExtractVariables } from '@/hooks/useFetchOnBlock'
import { getMonetaryBaseVariables, monetaryBaseDocument } from '@/MonetaryBase/operations'
import { Times } from '@/utils/dates'
import { useCallback, useRef } from 'react'

interface MonetaryBaseChartProps {
  initialData: DocumentNodeData<typeof monetaryBaseDocument> | null
  initialVariables: ExtractVariables<typeof monetaryBaseDocument>
  initialError: boolean
  selectedTime: Times
}

export default function MonetaryBaseChart({
  initialVariables,
  initialError,
  initialData,
  selectedTime,
}: MonetaryBaseChartProps) {
  const lastVariables = useRef<ExtractVariables<typeof monetaryBaseDocument>>(initialVariables)

  const variables = useCallback((_: number, timestamp: string) => {
    return lastVariables.current = getMonetaryBaseVariables(timestamp, selectedTime)
  }, [])

  const {data, error, refetch, isLoading} = useFetchOnBlock({
    query: monetaryBaseDocument,
    variables,
    initialResult: initialData,
    initialError,
  })

  return null

}
