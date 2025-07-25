'use client'

import { Suspense } from 'react'
import { Times } from '@/utils/dates'
import { useSuspenseQuery } from '@apollo/client'
import { getMonetaryBaseVariables, monetaryBaseDocument } from '@/MonetaryBase/operations'
import { latestBlockQuery } from '@/api/operations'
import MonetaryBaseChart from '@/MonetaryBase/Chart'
import { DocumentNodeData } from '@/hooks/useFetchOnBlock'

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
    <div className={'h-[360px] w-full bg-[color:var(--secondary-background)] px-4 rounded-md'}>
      <div className={'h-[50px] flex items-center'}>
        <h2>Monetary Base</h2>
      </div>
      <Suspense

      >
        <MonetaryBaseData selectedTime={selectedTime} />
      </Suspense>
    </div>
  )
}
