'use client'

import useFetchOnBlock, { DocumentNodeData, ExtractVariables } from '@/hooks/useFetchOnBlock'
import { getSupplyCompositionVariables, supplyCompositionDocument } from '@/api/operations'
import React, { useCallback, useRef } from 'react'
import { Times } from '@/utils/dates'

interface SupplyCompositionContext {
  data: DocumentNodeData<typeof supplyCompositionDocument> | null
  lastVariables: ExtractVariables<typeof supplyCompositionDocument> | null
  error: boolean
  isLoading: boolean
  refetch: () => void
}

const SupplyCompositionContext = React.createContext<SupplyCompositionContext>({
  data: null,
  lastVariables: null,
  error: false,
  isLoading: false,
  refetch: () => {}
})

interface SupplyCompositionProps {
  selectedTime: Times
  initialData: DocumentNodeData<typeof supplyCompositionDocument> | null
  initialError: boolean
  initialVariables: ExtractVariables<typeof supplyCompositionDocument> | null
  children: React.ReactNode
}

export default function SupplyCompositionProvider({
  children,
  selectedTime,
  initialData,
  initialError,
  initialVariables,
}: SupplyCompositionProps) {
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

  return (
    <SupplyCompositionContext
      value={{
        data,
        isLoading,
        refetch,
        lastVariables: lastVariables.current,
        error,
      }}
    >
      {children}
    </SupplyCompositionContext>
  )
}

export function useSupplyComposition() {
  return React.useContext(SupplyCompositionContext)
}
