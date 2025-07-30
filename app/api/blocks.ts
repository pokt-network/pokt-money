import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import { getClient } from '@/config/apollo/rsc'
import { latestBlockQuery, numBlocksPerSessionDocument } from '@/api/operations'
import { Block } from '@/config/gql/graphql'

export const getLatestBlock = cache(
  unstable_cache(
    async (): Promise<Block> => {
      const {data} = await getClient().query({
        query: latestBlockQuery
      })

      return data!.blocks!.nodes!.at(0)! as unknown as Block
    },
    ['latest_block'],
    { revalidate: 30}
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
