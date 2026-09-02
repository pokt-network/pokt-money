const inFlight = new Map<string, Promise<unknown>>()

/**
 * Shares a single in-flight promise between concurrent callers that use the same arguments.
 *
 * `unstable_cache` does not coalesce concurrent misses: N requests hitting a cold key at the same
 * time run the underlying function N times. For queries that take ~30 s on the indexer that is a
 * lot of wasted work, so we dedupe at the process level while the promise is pending.
 */
export function dedupeInFlight<Args extends unknown[], Result>(
  name: string,
  fn: (...args: Args) => Promise<Result>
): (...args: Args) => Promise<Result> {
  return (...args: Args) => {
    const key = `${name}:${JSON.stringify(args)}`

    const pending = inFlight.get(key) as Promise<Result> | undefined
    if (pending) {
      return pending
    }

    const promise = fn(...args).finally(() => {
      inFlight.delete(key)
    })

    inFlight.set(key, promise)

    return promise
  }
}
