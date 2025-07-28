import { Times } from '@/utils/dates'
import { DocumentNodeData, ExtractVariables } from '@/hooks/useFetchOnBlock'
import {
  currentSupplyMintBurnDocument,
  getCurrentSupplyMintBurnVariables,
} from '@/Projection/operations'
import { getClient } from '@/config/apollo/rsc'
import { getLatestBlock } from '@/api/blocks'
import ProjectionsLoader from '@/Projection/Loader'
import ProjectionCharts from '@/Projection/Charts'
import { Suspense } from 'react'

interface ProjectionsProps {
  timeSelected: Times
}

async function ServerProjections({timeSelected}: ProjectionsProps) {
  let data: DocumentNodeData<typeof currentSupplyMintBurnDocument> | null = null,
    error = false,
    variables: ExtractVariables<typeof currentSupplyMintBurnDocument> | null = null

  try {
    const latestBlock = await getLatestBlock()

    const response = await getClient().query({
      query: currentSupplyMintBurnDocument,
      variables: variables = getCurrentSupplyMintBurnVariables(latestBlock.timestamp, timeSelected)
    })

    data = response.data
  } catch {
    error = true
  }

  return (
    <ProjectionCharts
      initialData={data}
      initialError={error}
      timeSelected={timeSelected}
      initialVariables={variables}
    />
  )
}

export default function Projections({timeSelected}: ProjectionsProps) {
  return (
    <div className={'h-[910px] md:h-[720px] lg:h-[360px] w-full bg-[color:var(--secondary-background)] px-4 rounded-md flex flex-col'}>
      <div className={'min-h-[40px] h-[40px] sm:min-h-[50px] flex items-center'}>
        <h2>Projections</h2>
      </div>

      <div
        className={'h-full grid md:grid-cols-2 lg:grid-cols-3 justify-center lg:px-2.5 xl:px-[50px] 2xl:px-[85px]'}
      >
        <Suspense
          fallback={
            <ProjectionsLoader />
          }
          key={timeSelected}
        >
          <ServerProjections timeSelected={timeSelected} />
        </Suspense>
      </div>
    </div>
  )
}
