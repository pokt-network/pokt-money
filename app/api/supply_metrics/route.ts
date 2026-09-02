import { getSupplyMetrics } from '@/api/supplyMetrics'
import { timeKey } from '@/constants'
import { getValidTime } from '@/utils/dates'

/**
 * Serves the cached supply/mint/burn metrics to the browser so client-side refreshes go through
 * the server cache instead of re-running the indexer aggregates on every block.
 */
export async function GET(request: Request) {
  const time = getValidTime(new URL(request.url).searchParams.get(timeKey) || '')

  try {
    const metrics = await getSupplyMetrics(time)

    return Response.json(metrics, {
      headers: { 'Cache-Control': 'public, max-age=30' },
    })
  } catch {
    return new Response(null, { status: 502 })
  }
}
