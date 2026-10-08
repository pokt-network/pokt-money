// The indexer's money functions (legacy*, get*Json) answer either their bare JSON (before its range
// contract) or {range, data}: the data as before plus the part of the requested range it covers.
// unwrapRange normalises the range once; every other helper here takes the normalised form.
export interface MoneyRange {
  requested_from: string | null
  requested_to: string | null
  // null when nothing in the range is covered (whatever the data then is: null, [] or zeros)
  covered_from: string | null
  covered_to: string | null
  // half-open [from, to); a null edge is unbounded on that side (clipped to the covered bounds)
  gaps: Array<{ from: string | null, to: string | null }>
  // Whether requested_to/covered_to are the last instant included (legacy*: yes, also when absent).
  // Nothing here depends on it: the note compares requested_to with covered_to, which share it, and
  // a span measured to an inclusive end is short by one timestamp unit, nothing for a yearly rate.
  end_inclusive?: boolean
}

export interface RangedResult<Data> {
  data: Data | null
  range: MoneyRange | null
  // the answer's range lacked a bound (contract drift), read as null
  drift: boolean
}

const orNull = (value: unknown): string | null => (typeof value === 'string' ? value : null)

/**
 * Reads either shape. `data` null means nothing in the range is covered: no data, not 0. A missing
 * bound becomes null (and `drift` says so), so a range missing a covered bound reads as uncovered.
 */
export function unwrapRange<Data>(value: unknown): RangedResult<Data> {
  if (value === null || typeof value !== 'object' || Array.isArray(value) || !('range' in value) || !('data' in value)) {
    return { data: (value ?? null) as Data | null, range: null, drift: false }
  }

  const { range: raw, data } = value as { range: Record<string, unknown> | null, data: Data | null }
  if (!raw) {
    return { data: data ?? null, range: null, drift: false }
  }

  const keys = ['requested_from', 'requested_to', 'covered_from', 'covered_to'] as const
  const rawGaps = Array.isArray(raw.gaps) ? raw.gaps as Array<Record<string, unknown>> : []
  const drift = keys.some((key) => raw[key] === undefined) || !Array.isArray(raw.gaps)
    || rawGaps.some((gap) => gap?.from === undefined || gap?.to === undefined)
  const range: MoneyRange = {
    requested_from: orNull(raw.requested_from),
    requested_to: orNull(raw.requested_to),
    covered_from: orNull(raw.covered_from),
    covered_to: orNull(raw.covered_to),
    gaps: rawGaps.map((gap) => ({ from: orNull(gap?.from), to: orNull(gap?.to) })),
    ...(typeof raw.end_inclusive === 'boolean' && { end_inclusive: raw.end_inclusive }),
  }

  return { data: data ?? null, range, drift }
}

function time(iso: string | null): number {
  return iso ? new Date(iso).getTime() : NaN
}

/** Nothing in the requested range is covered: a null covered bound. */
export function isUncovered(range: MoneyRange): boolean {
  return range.covered_from === null || range.covered_to === null
}

// Shorter gaps are rounding, not missing data.
const MIN_GAP_MS = 60 * 1000

/** The gaps clipped to [covered_from, covered_to], sorted, overlaps merged, under a minute dropped. */
export function normalizeGaps(range: MoneyRange): Array<{ from: string, to: string }> {
  const from = time(range.covered_from)
  const to = time(range.covered_to)
  if (!(from <= to)) {
    return []
  }

  const clipped = range.gaps
    .map((gap) => ({
      from: gap.from === null ? from : Math.max(time(gap.from), from),
      to: gap.to === null ? to : Math.min(time(gap.to), to),
    }))
    .filter((gap) => gap.from < gap.to)
    .sort((a, b) => a.from - b.from)

  const merged: Array<{ from: number, to: number }> = []
  for (const gap of clipped) {
    const last = merged.at(-1)
    if (last && gap.from <= last.to) {
      last.to = Math.max(last.to, gap.to)
    } else {
      merged.push({ ...gap })
    }
  }

  return merged
    .filter((gap) => gap.to - gap.from >= MIN_GAP_MS)
    .map((gap) => ({ from: new Date(gap.from).toISOString(), to: new Date(gap.to).toISOString() }))
}

/** Milliseconds of the requested range the data covers: [covered_from, covered_to] minus the gaps. */
export function coveredMs(range: MoneyRange, gaps = normalizeGaps(range)): number {
  const from = time(range.covered_from)
  const to = time(range.covered_to)
  if (!(from <= to)) {
    return 0
  }

  return gaps.reduce((total, gap) => total - (time(gap.to) - time(gap.from)), to - from)
}

/**
 * One range for figures read over the same window: covered from the later start to the earlier end,
 * with the gaps of both. Callers pass only covered ranges (see readRangedFigures).
 */
export function combineRanges(a: MoneyRange | null, b: MoneyRange | null): MoneyRange | null {
  if (!a || !b) {
    return a ?? b
  }

  const later = (x: string | null, y: string | null) => (x === null || y === null ? null : time(x) >= time(y) ? x : y)
  const earlier = (x: string | null, y: string | null) => (x === null || y === null ? null : time(x) <= time(y) ? x : y)

  return {
    ...a,
    covered_from: later(a.covered_from, b.covered_from),
    covered_to: earlier(a.covered_to, b.covered_to),
    gaps: [...a.gaps, ...b.gaps],
  }
}

export interface RangedFigure<Data> {
  value: Data | null
  // the figure is unknown because its range covers nothing
  uncovered: boolean
}

let driftWarned = false

/**
 * Reads two figures answered over the same window, in either shape and possibly in different ones
 * (one cached before the indexer's deploy, or one from the live fallback). A figure whose range
 * covers nothing is unknown (null, `uncovered`), never its zero object. `range` combines the ranges
 * of the covered figures only, so it never describes an unknown figure beside a known one; it is the
 * uncovered range itself only when no figure is known.
 */
export function readRangedFigures<A, B>(rawA: unknown, rawB: unknown): { a: RangedFigure<A>, b: RangedFigure<B>, range: MoneyRange | null } {
  const readA = unwrapRange<A>(rawA)
  const readB = unwrapRange<B>(rawB)
  if ((readA.drift || readB.drift) && !driftWarned) {
    driftWarned = true
    console.warn('money range with missing fields, read as null (a missing covered bound reads as uncovered)', (readA.drift ? readA : readB).range)
  }

  const figure = <Data>({ data, range }: RangedResult<Data>): RangedFigure<Data> => {
    const uncovered = !!range && isUncovered(range)
    return { value: uncovered ? null : data, uncovered }
  }
  const a = figure(readA)
  const b = figure(readB)

  const covered = [readA, readB].filter(({ range }) => range && !isUncovered(range)).map(({ range }) => range)
  const anyKnown = a.value !== null || b.value !== null
  const range = covered.length > 0
    ? combineRanges(covered[0], covered[1] ?? null)
    : anyKnown ? null : readA.range ?? readB.range

  return { a, b, range }
}

// Bounds closer than this are the same instant for the note (the indexer may round timestamps).
const SAME_TIME_MS = 60 * 1000
const MAX_GAPS_LISTED = 3

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'UTC',
})

function format(iso: string): string {
  return `${dateFormatter.format(new Date(iso))} UTC`
}

export const NO_DATA_NOTE = 'No data for this range'

/**
 * A short note for a range that does not cover everything requested ("Data since Sep 1, 2026,
 * 12:00 UTC", "through ...", the gaps), or null when it covers it all or there is no range (the
 * old shape).
 */
export function describePartialRange(range: MoneyRange | null | undefined, gaps = range ? normalizeGaps(range) : []): string | null {
  if (!range) {
    return null
  }
  if (isUncovered(range)) {
    return NO_DATA_NOTE
  }
  if (time(range.covered_from) > time(range.covered_to)) {
    // combined from figures that cover different, disjoint parts of the range
    return 'Only parts of this range are covered'
  }

  const parts: Array<string> = []
  if (range.covered_from && time(range.covered_from) - time(range.requested_from) > SAME_TIME_MS) {
    parts.push(`Data since ${format(range.covered_from)}`)
  }
  if (range.covered_to && time(range.requested_to) - time(range.covered_to) > SAME_TIME_MS) {
    parts.push(`through ${format(range.covered_to)}`)
  }
  if (gaps.length > 0) {
    const listed = gaps.slice(0, MAX_GAPS_LISTED).map((gap) => `${format(gap.from)} – ${format(gap.to)}`)
    const more = gaps.length > MAX_GAPS_LISTED ? `, +${gaps.length - MAX_GAPS_LISTED} more` : ''
    parts.push(`${gaps.length} gap${gaps.length > 1 ? 's' : ''}: ${listed.join(', ')}${more}`)
  }

  return parts.length > 0 ? parts.join('; ') : null
}
