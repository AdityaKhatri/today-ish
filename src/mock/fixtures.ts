import type { Effort } from '@/lib/scoring'
import type { RoutineView, TaskView } from '@/lib/views'
import type { Profile, ProfileFilter } from '@/types/models'

/**
 * Static fixtures mirroring the design mockups. These stand in until the
 * Firestore data layer is wired (blocked on DATA_MODEL.md / firestore.rules).
 * Screens read these through the same view-model shapes the live data will use,
 * so swapping the source later is a localized change.
 */

export interface MockTask extends TaskView {
  profile: Profile
  effort: Effort
  deadlineText: string
  scoreNote: string
  notes?: string
}

export const MOCK_TASKS: MockTask[] = [
  { id: 't1', title: 'Follow up with vendor invoice', profile: 'work', meta: 'Work · 15min · overdue 2 days', tier: 'red', live: -8, bleed: 12, effort: '15min', deadlineText: 'Overdue · was due Jul 19', scoreNote: 'Overdue — bleeding fast' },
  { id: 't2', title: 'Send Q3 budget draft', profile: 'work', meta: 'Work · 1hr+ · due today, 6:00pm', tier: 'amber', live: 126, bleed: 15, effort: '1hr+', deadlineText: 'Today, 6:00 PM', scoreNote: 'Decaying soon — due tonight', notes: 'Include the marketing line-item breakdown Priya asked for.' },
  { id: 't3', title: "Review Sarah's PR", profile: 'work', meta: 'Work · 15min · due today', tier: 'amber', live: 42, bleed: 8, effort: '15min', deadlineText: 'Today', scoreNote: 'Decaying soon', notes: "It's blocking someone else." },
  { id: 't4', title: 'Call plumber about leak', profile: 'personal', meta: 'Personal · 15min · due today', tier: 'amber', live: 46, bleed: 9, effort: '15min', deadlineText: 'Today', scoreNote: 'Decaying soon' },
  { id: 't5', title: 'Return Amazon package', profile: 'personal', meta: 'Personal · 15min · due tomorrow', tier: 'green', live: 40, bleed: 4, effort: '15min', deadlineText: 'Tomorrow', scoreNote: 'Healthy — plenty of runway' },
  { id: 't6', title: 'Renew passport', profile: 'personal', meta: 'Personal · 30min · due this week', tier: 'green', live: 53, bleed: 3, effort: '30min', deadlineText: 'This week', scoreNote: 'Healthy — plenty of runway' },
  { id: 't7', title: "Book flight for mom's visit", profile: 'personal', meta: 'Personal · 30min · due this week', tier: 'green', live: 52, bleed: 3, effort: '30min', deadlineText: 'This week', scoreNote: 'Healthy — plenty of runway' },
]

export interface MockRoutine extends RoutineView {
  profile: Profile
}

export const MOCK_ROUTINES: MockRoutine[] = [
  { id: 'r1', title: 'Morning workout', status: 'done', sub: '7:12am', profile: 'personal' },
  { id: 'r2', title: 'Drink water 3×', status: 'done', sub: '3/3 today', profile: 'personal' },
  { id: 'r3', title: 'Inbox zero check', status: 'pending', sub: 'window 6–11am · closes in 2h', profile: 'work' },
  { id: 'r4', title: 'Evening wind-down reading', status: 'pending', sub: 'anytime today', profile: 'personal' },
  { id: 'r5', title: 'Vitamins', status: 'missed', sub: 'resets tomorrow', profile: 'personal' },
]

export function filterByProfile<T extends { profile: Profile }>(
  items: T[],
  filter: ProfileFilter,
): T[] {
  return filter === 'all' ? items : items.filter((i) => i.profile === filter)
}

/** Sum of live scores = "potential if you clear the queue". */
export function sumPotential(tasks: TaskView[]): number {
  return tasks.reduce((acc, t) => acc + t.live, 0)
}

/** Sum of daily bleed = "−X/day if you don't". */
export function sumBleed(tasks: TaskView[]): number {
  return tasks.reduce((acc, t) => acc + t.bleed, 0)
}
