/** Date helpers. Routines reset at LOCAL midnight, so day math is local-time. */

export const DAY_MS = 24 * 60 * 60 * 1000

/** Local-date key `YYYY-MM-DD` — used for routineLog doc ids and daily reset. */
export function localDateKey(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function startOfLocalDay(d: Date = new Date()): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

/** The local-date key for the day before the given `YYYY-MM-DD` key. */
export function previousDateKey(dateKey: string): string {
  const d = new Date(`${dateKey}T00:00:00`)
  return localDateKey(new Date(d.getTime() - DAY_MS))
}

/** 0 = Sunday … 6 = Saturday (JS `getDay`). */
export function localDayOfWeek(d: Date = new Date()): number {
  return d.getDay()
}

/** e.g. "Tuesday, July 21" */
export function formatLongDate(d: Date = new Date()): string {
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
}

/** e.g. "6:00 PM" */
export function formatTime(d: Date): string {
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

/**
 * Human deadline label relative to now:
 *   "overdue 2 days" · "due today, 6:00 PM" · "due tomorrow" · "due this week"
 */
export function relativeDeadlineLabel(deadline: Date, now: Date = new Date()): string {
  const startToday = startOfLocalDay(now).getTime()
  const startDeadline = startOfLocalDay(deadline).getTime()
  const dayDiff = Math.round((startDeadline - startToday) / DAY_MS)

  if (dayDiff < 0) {
    const n = Math.abs(dayDiff)
    return `overdue ${n} day${n === 1 ? '' : 's'}`
  }
  if (dayDiff === 0) return `due today, ${formatTime(deadline)}`
  if (dayDiff === 1) return 'due tomorrow'
  if (dayDiff <= 7) return 'due this week'
  return `due ${deadline.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
}
