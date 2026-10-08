'use client'

import { DocumentNodeData, ExtractVariables, useFetchOnBlockCore } from '@/hooks/useFetchOnBlock'
import { supplyCompositionDocument } from '@/api/operations'
import { fetchCachedRoute } from '@/utils/fetchCachedRoute'
import type { SupplyCompositionResult } from '@/api/supply'
import React from 'react'
import { Times } from '@/utils/dates'

const fetchSupplyComposition = (time: string) => fetchCachedRoute<SupplyCompositionResult>('supply_composition', time)

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
  // Refreshes on every block through our own route handler, which serves the server-side cache
  // and returns the window it queried along with the data.
  const {data: result, error, refetch, isLoading} = useFetchOnBlockCore({
    fetcher: fetchSupplyComposition,
    variables: selectedTime,
    initialResult: initialData && initialVariables ? { data: initialData, variables: initialVariables } : undefined,
    initialError: initialError,
  })

  return (
    <SupplyCompositionContext
      value={{
        data: result?.data ?? null,
        isLoading,
        refetch,
        lastVariables: result?.variables ?? null,
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
