import { relativeDeadlineLabel } from './dates'
import { dailyBleed, liveScore, peakScore, urgencyTier } from './scoring'
import type { UrgencyTier } from './scoring'
import type { Task } from '@/types/models'

/**
 * Presentation view-models. Components depend on these, not on the Firestore
 * document types, so the score math lives in one place and the UI stays dumb.
 */

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
  const deadlineMs = task.deadline.toMillis()
  const createdMs = task.createdAt.toMillis()
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
  const label = task.category ?? (task.profile === 'work' ? 'Work' : 'Personal')
  const meta = `${label} · ${task.effort} · ${relativeDeadlineLabel(new Date(deadlineMs), new Date(nowMs))}`
  return { id: task.id, title: task.title, meta, tier, live, bleed }
}

export type RoutineStatusView = 'done' | 'pending' | 'missed'

export interface RoutineView {
  id: string
  title: string
  status: RoutineStatusView
  /** e.g. "window 6–11am · closes in 2h" · "3/3 today" · "resets tomorrow" */
  sub: string
}
