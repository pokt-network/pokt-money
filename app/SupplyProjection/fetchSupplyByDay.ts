import type { ShannonSupplyByDay } from '@/SupplyProjection/types'

// Browser-side fetch of the server-cached daily series (see app/api/supply_by_day/route.ts).
export async function fetchSupplyByDay(): Promise<{ data: ShannonSupplyByDay | null, error?: unknown }> {
  const response = await fetch('/api/supply_by_day', { cache: 'no-store' })

  if (!response.ok) {
    return { data: null, error: new Error(`supply_by_day responded with ${response.status}`) }
  }

  return { data: await response.json() as ShannonSupplyByDay }
}
