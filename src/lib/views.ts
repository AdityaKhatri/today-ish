import { effortLabel, dailyBleed, liveScore, peakScore, urgencyTier } from './scoring'
import type { UrgencyTier } from './scoring'
import { relativeDeadlineLabel } from './dates'
import type { Routine, RoutineLog, Task } from '@/types/models'

/**
 * Presentation view-models. Components depend on these, not on the Firestore
 * document types, so the score/status math lives in one place.
 */

function capitalize(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s
}

// ── Tasks ─────────────────────────────────────────────────────────────────────

export interface TaskView {
  id: string
  title: string
  /** e.g. "Work · 15min · overdue 2 days" */
  meta: string
  tier: UrgencyTier
  /** current live score (can be negative) */
  live: number
  /** points lost per day at `now` */
  bleed: number
}

export function buildTaskView(task: Task, nowMs: number): TaskView {
  const deadlineMs = task.deadline ? task.deadline.toMillis() : Number.POSITIVE_INFINITY
  // Guard the brief window where a serverTimestamp() write is still pending.
  const createdMs = task.createdAt ? task.createdAt.toMillis() : nowMs
  const peak = peakScore(task.baseScore, task.urgencyMultiplier)
  const live = liveScore({
    peak,
    decayRatePerDay: task.decayRatePerDay,
    createdAt: createdMs,
    deadline: deadlineMs,
    now: nowMs,
  })
  const bleed = Math.round(dailyBleed(task.decayRatePerDay, deadlineMs, nowMs))
  const tier = urgencyTier(deadlineMs, nowMs, live)
  const deadlineLabel = task.deadline
    ? relativeDeadlineLabel(new Date(deadlineMs), new Date(nowMs))
    : 'no deadline'
  const meta = `${capitalize(task.category)} · ${effortLabel(task.effortMinutes)} · ${deadlineLabel}`
  return { id: task.id, title: task.title, meta, tier, live, bleed }
}

// ── Routines ───────────────────────────────────────────────────────────────────

export type RoutineStatusView = 'done' | 'pending' | 'missed'

export interface RoutineView {
  id: string
  title: string
  status: RoutineStatusView
  /** e.g. "window 6:00am–11:00am" · "3/3 today" · "resets tomorrow" */
  sub: string
}

function hmToMinutes(hm: string): number {
  const [h, m] = hm.split(':').map(Number)
  return h * 60 + m
}

function fmtHm(hm: string): string {
  const [h, m] = hm.split(':').map(Number)
  const am = h < 12
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${`${m}`.padStart(2, '0')}${am ? 'am' : 'pm'}`
}

/** Has the routine's window closed for today (→ missed if not yet done)? */
function windowClosed(routine: Routine, now: Date): boolean {
  const cur = now.getHours() * 60 + now.getMinutes()
  if (routine.windowType === 'fixed' && routine.windowStart) {
    return cur > hmToMinutes(routine.windowStart)
  }
  if (routine.windowType === 'flexible' && routine.windowEnd) {
    return cur > hmToMinutes(routine.windowEnd)
  }
  // anytime / multi never close before local midnight
  return false
}

function routineSubtext(
  routine: Routine,
  log: RoutineLog | undefined,
  status: RoutineStatusView,
): string {
  if (status === 'missed') return 'resets tomorrow'
  if (routine.windowType === 'multi') {
    const target = routine.targetCount ?? 1
    const count = status === 'done' ? target : (log?.count ?? 0)
    return `${count}/${target} today`
  }
  if (status === 'done') return 'done today'
  if (routine.windowType === 'fixed' && routine.windowStart) {
    return `at ${fmtHm(routine.windowStart)}`
  }
  if (routine.windowType === 'flexible' && routine.windowStart && routine.windowEnd) {
    return `window ${fmtHm(routine.windowStart)}–${fmtHm(routine.windowEnd)}`
  }
  return 'anytime today'
}

/** Is this routine "done" for the day, accounting for multi target counts? */
export function isRoutineDone(routine: Routine, log: RoutineLog | undefined): boolean {
  if (!log || log.status !== 'done') return false
  if (routine.windowType === 'multi' && routine.targetCount) {
    return (log.count ?? 0) >= routine.targetCount
  }
  return true
}

export function buildRoutineView(
  routine: Routine,
  log: RoutineLog | undefined,
  now: Date,
): RoutineView {
  let status: RoutineStatusView
  if (isRoutineDone(routine, log)) status = 'done'
  else if (windowClosed(routine, now)) status = 'missed'
  else status = 'pending'
  return {
    id: routine.id,
    title: routine.title,
    status,
    sub: routineSubtext(routine, log, status),
  }
}

/** Is the routine scheduled for the given local day-of-week (0=Sun…6=Sat)? */
export function routineActiveOn(routine: Routine, dayOfWeek: number): boolean {
  return routine.repeatDays.includes(dayOfWeek)
}

// ── Aggregates for the score header ──────────────────────────────────────────

/** Total live score = "potential if you clear the queue". */
export function sumLive(views: TaskView[]): number {
  return views.reduce((acc, v) => acc + v.live, 0)
}

/** Total daily bleed = "−X/day if you don't". */
export function sumBleed(views: TaskView[]): number {
  return views.reduce((acc, v) => acc + v.bleed, 0)
}
