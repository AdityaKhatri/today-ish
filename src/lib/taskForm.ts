import { localDateKey } from './dates'

/** Shared task-form helpers used by Add (mobile + desktop) and edit (detail). */

export type DeadlineChoice = 'today' | 'tomorrow' | 'week' | 'pick'

export const DEADLINE_OPTIONS: ReadonlyArray<{ value: DeadlineChoice; label: string }> = [
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'week', label: 'This week' },
  { value: 'pick', label: 'Pick date' },
]

export const DEADLINE_PHRASE: Record<DeadlineChoice, string> = {
  today: 'same-day',
  tomorrow: 'tomorrow',
  week: 'this-week',
  pick: 'chosen',
}

export function endOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(23, 59, 59, 0)
  return x
}

export function deadlineToDate(choice: DeadlineChoice, pickedISO: string): Date {
  const now = new Date()
  if (choice === 'today') return endOfDay(now)
  if (choice === 'tomorrow') return endOfDay(new Date(now.getTime() + 86_400_000))
  if (choice === 'week') return endOfDay(new Date(now.getTime() + 7 * 86_400_000))
  return endOfDay(
    pickedISO ? new Date(`${pickedISO}T23:59:59`) : new Date(now.getTime() + 3 * 86_400_000),
  )
}

/** A sensible non-blank default for the date picker (3 days out). */
export function defaultPickedISO(): string {
  return localDateKey(new Date(Date.now() + 3 * 86_400_000))
}
