import { Times } from '@/utils/dates'
import useFetchOnBlock, { DocumentNodeData, ExtractVariables } from '@/hooks/useFetchOnBlock'
import { getSupplyCompositionVariables, supplyCompositionDocument } from '@/api/operations'
import { useCallback, useRef } from 'react'

interface UseSupplyCompositionProps {
  selectedTime: Times
  initialData: DocumentNodeData<typeof supplyCompositionDocument> | null
  initialError: boolean
  initialVariables: ExtractVariables<typeof supplyCompositionDocument> | null
}

export default function useSupplyComposition({
  selectedTime,
  initialData,
  initialError,
  initialVariables
}: UseSupplyCompositionProps) {
  const lastVariables = useRef<ExtractVariables<typeof supplyCompositionDocument> | null>(initialVariables)

  const variables = useCallback((_: number, timestamp: string) => {
    return lastVariables.current = getSupplyCompositionVariables(timestamp, selectedTime)
  }, [selectedTime])

  const {data, error, refetch, isLoading} = useFetchOnBlock({
    query: supplyCompositionDocument,
    variables,
    initialResult: initialData,
    initialError: initialError,
  })

  return {
    data,
    error,
    refetch,
    isLoading,
    lastVariables: lastVariables.current
  }
}
