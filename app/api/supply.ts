import { DocumentNodeData, ExtractVariables } from '@/hooks/useFetchOnBlock'
import { cache } from 'react'
import { getClient } from "@/config/apollo/rsc"
import { getLatestBlock } from '@/api/blocks'
import { getSupplyCompositionVariables, supplyCompositionDocument } from '@/api/operations'

export const getSupplyComposition = cache(async (timeSelected: string) => {
  let data: DocumentNodeData<typeof supplyCompositionDocument> | null = null, error = false, variables: ExtractVariables<typeof supplyCompositionDocument> | null = null
  try {
    const latestBlock = await getLatestBlock()

    const response = await getClient().query({
      query: supplyCompositionDocument,
      variables: variables = getSupplyCompositionVariables(latestBlock.timestamp, timeSelected)
    })

    data = response.data
  } catch {
    error = true
  }

  return {
    data,
    error,
    variables,
  }
})
