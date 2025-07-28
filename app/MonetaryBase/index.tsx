'use client'

import { Suspense } from 'react'
import { Times } from '@/utils/dates'
import { useSuspenseQuery } from '@apollo/client'
import { getMonetaryBaseVariables, monetaryBaseDocument } from '@/MonetaryBase/operations'
import { latestBlockQuery } from '@/api/operations'
import MonetaryBaseChart from '@/MonetaryBase/Chart'
import { DocumentNodeData } from '@/hooks/useFetchOnBlock'
import BaseLineBarChart from '@/components/BaseLineBarChart'

interface MonetaryBaseProps {
  selectedTime: Times
}

function MonetaryBaseData({selectedTime}: MonetaryBaseProps) {
  const {data, error} = useSuspenseQuery(latestBlockQuery)

  const variables = getMonetaryBaseVariables(
    data?.blocks?.nodes?.at(0)?.timestamp || new Date().toISOString(),
    selectedTime,
  )

  let monetaryBaseData: DocumentNodeData<typeof monetaryBaseDocument> | null = null, errorHappened = !!error

  if (data) {
    const response = useSuspenseQuery(monetaryBaseDocument, {
      variables,
    })

    if (response.data) {
      monetaryBaseData = response.data
    } else {
      errorHappened = true
    }
  }

  return (
    <MonetaryBaseChart
      initialData={monetaryBaseData}
      initialError={errorHappened}
      selectedTime={selectedTime}
      initialVariables={variables}
    />
  )
}

export default function MonetaryBase({selectedTime}: MonetaryBaseProps) {
  return (
    <div className={'h-[360px] w-full xl:w-2/3 bg-[color:var(--secondary-background)] px-4 rounded-md flex flex-col'}>
      <div className={'h-[50px] flex items-center'}>
        <h2>Monetary Base</h2>
      </div>
      <Suspense
        key={selectedTime}
        fallback={(
          <div className={'h-[300px]'}>
            <BaseLineBarChart
              data={{}}
              yAxisKey={'amount'}
              yAxisLabel={''}
              lineColor={''}
              isLoading={true}
            />
          </div>
        )}
      >
        <MonetaryBaseData selectedTime={selectedTime} />
      </Suspense>
    </div>
  )
}
