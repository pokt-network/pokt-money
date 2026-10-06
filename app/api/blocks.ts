import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import { getClient } from '@/config/apollo/rsc'
import { latestBlockQuery, numBlocksPerSessionDocument } from '@/api/operations'
import { freshCache } from '@/utils/freshCache'

// Anchors every query window, so it must not lag after an idle period (see freshCache).
export const getLatestBlock = cache(
  freshCache(
    'latest_block',
    async () => {
      const {data} = await getClient().query({
        query: latestBlockQuery
      })

      return data!.blocks!.nodes!.at(0)!
    },
    30 * 1000
  )
)

export const getNumBlocksPerSession = cache(
  unstable_cache(
    async (): Promise<number> => {
      const {data} = await getClient().query({
        query: numBlocksPerSessionDocument
      })

      return Number(data?.params?.nodes?.at(0)?.value || 0)
    },
    ['blocks_per_session'],
    { revalidate: 60}
  )
)
