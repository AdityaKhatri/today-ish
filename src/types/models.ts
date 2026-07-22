import type { Timestamp } from 'firebase/firestore'
import type { Effort } from '@/lib/scoring'

/**
 * Domain types.
 *
 * PROVISIONAL — this mirrors the brief + mockups and is pending exact
 * reconciliation with DATA_MODEL.md (field names, doc-id conventions, and which
 * fields are required). The Firestore read/write layer in `src/data/` is the
 * single place that will change if the schema differs.
 */

export type Profile = 'personal' | 'work'
/** The Home/Tasks/Routines segmented control adds an "all" view over the two profiles. */
export type ProfileFilter = Profile | 'all'

// ── Tasks (one-off, deadline-bound, decay model) ─────────────────────────────

export interface Task {
  id: string
  title: string
  notes?: string
  profile: Profile
  category?: string
  effort: Effort

  /** Frozen at add-time. */
  baseScore: number
  urgencyMultiplier: number
  decayRatePerDay: number

  createdAt: Timestamp
  deadline: Timestamp

  completed: boolean
  /** Client-side `Timestamp.now()` at the instant of the tap (offline-correct). */
  completedAt?: Timestamp | null
  /** Live score locked in at completion. */
  scoreAtCompletion?: number | null
}

// ── Routines (recurring, daily-reset, NO decay) ──────────────────────────────

export type RoutineWindow =
  | 'fixed-time'
  | 'flexible-window'
  | 'anytime-today'
  | 'few-times-per-day'

export interface Routine {
  id: string
  title: string
  profile: Profile
  category?: string

  windowType: RoutineWindow
  /** few-times-per-day */
  timesPerDay?: number
  /** fixed-time, "HH:mm" (local) */
  fixedTime?: string
  /** flexible-window, "HH:mm" (local) */
  windowStart?: string
  windowEnd?: string

  /** Days the routine is active. 0 = Sunday … 6 = Saturday. */
  daysOfWeek: number[]
  reminderOn: boolean

  /** Maintained transactionally on the doc — NOT recomputed from logs on read. */
  currentStreak: number
  longestStreak: number

  createdAt: Timestamp
}

export type RoutineStatus = 'hit' | 'miss'

/** Audit trail for hit-rate stats. Doc id: `${routineId}_${date}`. Not the fast path. */
export interface RoutineLog {
  id: string
  routineId: string
  /** YYYY-MM-DD (local) */
  date: string
  status: RoutineStatus
  /** few-times-per-day progress toward timesPerDay */
  count?: number
  completedAt?: Timestamp | null
}

// ── User ─────────────────────────────────────────────────────────────────────

export interface UserDoc {
  email: string
  displayName?: string
  activeProfile: Profile
  createdAt: Timestamp
}
