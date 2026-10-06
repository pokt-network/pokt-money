import { timeKey } from '@/constants'

// Browser-side fetch of one of our server-cached JSON routes (app/api/<route>/route.ts) for a time range.
export async function fetchCachedRoute<Result>(route: string, time: string): Promise<{ data: Result | null, error?: unknown }> {
  const response = await fetch(`/api/${route}?${timeKey}=${encodeURIComponent(time)}`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    return { data: null, error: new Error(`${route} responded with ${response.status}`) }
  }

  return { data: await response.json() as Result }
}
