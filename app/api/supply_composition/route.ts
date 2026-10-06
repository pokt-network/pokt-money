import { getSupplyComposition } from '@/api/supply'
import { timeKey } from '@/constants'
import { getValidTime } from '@/utils/dates'

/**
 * Serves the cached supply composition to the browser so client-side refreshes go through the
 * server cache instead of re-running getSupplyCompositionBetweenDates on every block in every tab.
 */
export async function GET(request: Request) {
  const time = getValidTime(new URL(request.url).searchParams.get(timeKey) || '')

  try {
    const result = await getSupplyComposition(time)

    return Response.json(result)
  } catch (error) {
    console.error('supply_composition failed', error)
    return new Response(null, { status: 502 })
  }
}
