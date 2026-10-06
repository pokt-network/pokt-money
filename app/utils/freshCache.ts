import { dedupeInFlight } from '@/utils/dedupeInFlight'

// A failed recomputation answers with the last value only while it is younger than this many TTLs;
// past that the error propagates, so an indexer outage still shows up as failed responses.
const MAX_STALE_TTLS = 10

/**
 * Process-level cache that never answers with a value older than `ttlMs` while `fn` succeeds.
 *
 * `unstable_cache` revalidates in the background: after an idle period its first caller gets a
 * value as old as that period. Here an expired value is recomputed before answering (concurrent
 * callers share one call). When that call fails the error is logged and the last value is served
 * if it is younger than MAX_STALE_TTLS TTLs.
 */
export function freshCache<Result>(name: string, fn: () => Promise<Result>, ttlMs: number): () => Promise<Result> {
  let last: { value: Result, computedAt: number } | undefined

  const recompute = dedupeInFlight(name, async () => {
    // a value is as old as the moment its query started
    const computedAt = Date.now()
    const value = await fn()
    last = { value, computedAt }
    return value
  })

  return async () => {
    if (last && Date.now() - last.computedAt < ttlMs) {
      return last.value
    }

    try {
      return await recompute()
    } catch (error) {
      console.error(`${name} failed`, error)
      if (last && Date.now() - last.computedAt < MAX_STALE_TTLS * ttlMs) {
        return last.value
      }
      throw error
    }
  }
}
