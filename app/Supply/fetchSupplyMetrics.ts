import { timeKey } from '@/constants'
import type { SupplyMetrics } from '@/Supply/types'

// Browser-side fetch of the server-cached metrics (see app/api/supply_metrics/route.ts).
export async function fetchSupplyMetrics(time: string): Promise<{ data: SupplyMetrics | null, error?: unknown }> {
  const response = await fetch(`/api/supply_metrics?${timeKey}=${encodeURIComponent(time)}`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    return { data: null, error: new Error(`supply_metrics responded with ${response.status}`) }
  }

  return { data: await response.json() as SupplyMetrics }
}
