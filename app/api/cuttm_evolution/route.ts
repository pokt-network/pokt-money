import { getCUTTMEvolution } from '@/api/cuttm'
import { timeKey } from '@/constants'
import { getValidTime } from '@/utils/dates'

/**
 * Serves the cached CUTTM series to the browser so client-side refreshes go through the server
 * cache instead of re-running the indexer function on every block in every tab.
 */
export async function GET(request: Request) {
  const time = getValidTime(new URL(request.url).searchParams.get(timeKey) || '')

  try {
    const result = await getCUTTMEvolution(time)

    return Response.json(result)
  } catch (error) {
    console.error('cuttm_evolution failed', error)
    return new Response(null, { status: 502 })
  }
}
