import { getShannonSupplyByDay } from '@/api/supplyByDay'

/**
 * Serves the cached daily supply series to the browser so client-side refreshes go through the
 * server cache instead of re-running getTotalSupplyByDay on the indexer.
 */
export async function GET() {
  try {
    const data = await getShannonSupplyByDay()

    return Response.json(data, {
      headers: { 'Cache-Control': 'public, max-age=300' },
    })
  } catch {
    return new Response(null, { status: 502 })
  }
}
