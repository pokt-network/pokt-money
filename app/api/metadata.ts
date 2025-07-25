import { indexerMetadataDocument } from '@/api/operations'
import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import { getClient } from '@/config/apollo/rsc'

const getMetadata = cache(
  unstable_cache(
    async () => {
      return await getClient().query({
        query: indexerMetadataDocument
      }).then((res) => res.data)
    },
    ['metadata'],
    { revalidate: 10}
  )
)

export default getMetadata
