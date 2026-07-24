import { DAY_MS, localDateKey, startOfLocalDay } from './dates'
import type { Profile, ProfileFilter, Task } from '@/types/models'

/** Does an item's profile match the current segmented-control selection? */
export function matchesProfile(itemProfile: Profile, filter: ProfileFilter): boolean {
  return filter === 'all' || itemProfile === filter
}

export type StatusFilter = 'active' | 'completed' | 'all'

export function matchesStatus(task: Task, status: StatusFilter): boolean {
  return status === 'all' || task.status === status
}

export type TimeframeFilter = 'all' | 'overdue' | 'today' | 'week' | 'later'

export function matchesTimeframe(task: Task, nowMs: number, tf: TimeframeFilter): boolean {
  if (tf === 'all') return true
  if (!task.deadline) return false // undated tasks only show under "All"
  const startToday = startOfLocalDay(new Date(nowMs)).getTime()
  const startDeadline = startOfLocalDay(task.deadline.toDate()).getTime()
  const dayDiff = Math.round((startDeadline - startToday) / DAY_MS)
  switch (tf) {
    case 'overdue':
      return dayDiff < 0
    case 'today':
      return dayDiff === 0
    case 'week':
      return dayDiff >= 1 && dayDiff <= 7
    case 'later':
      return dayDiff > 7
  }
}

/** Match tasks whose deadline falls on a specific local date (YYYY-MM-DD). */
export function matchesDueDate(task: Task, dueISO: string): boolean {
  if (!dueISO) return true
  if (!task.deadline) return false
  return localDateKey(task.deadline.toDate()) === dueISO
}
