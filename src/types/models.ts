import type { Timestamp } from 'firebase/firestore'

/**
 * Domain types — match DATA_MODEL.md exactly, except two fields marked ADDED
 * (needed for the few-times-per-day / "multi" window type, which the schema
 * doesn't otherwise represent). Those are flagged for reconciliation.
 */

export type Profile = 'personal' | 'work'
/** The Home/Tasks/Routines segmented control adds an "all" view over the two profiles. */
export type ProfileFilter = Profile | 'all'

// ── /users/{uid} ─────────────────────────────────────────────────────────────

export interface UserDoc {
  email: string
  displayName: string
  photoURL: string
  createdAt: Timestamp
  defaultProfile: Profile
  /** Set by the client so the Cloud Function knows whether to send push. */
  remindersEnabled?: boolean
  /** IANA timezone (client) — the function uses it for local routine times. */
  timezone?: string
}

// ── /users/{uid}/tasks/{taskId} ──────────────────────────────────────────────

export type TaskStatus = 'active' | 'completed'

export interface Task {
  id: string
  title: string
  notes: string | null
  /** "personal" | "work" | "errands" | custom */
  category: string
  profile: Profile
  status: TaskStatus
  createdAt: Timestamp
  deadline: Timestamp | null
  /** 5 | 15 | 30 | 60 */
  effortMinutes: number
  /** frozen at add-time */
  baseScore: number
  urgencyMultiplier: number
  decayRatePerDay: number
  /** CLIENT-set `Timestamp.now()` at the tap — never serverTimestamp(). */
  completedAt: Timestamp | null
  scoreAtCompletion: number | null
}

// ── /users/{uid}/routines/{routineId} ────────────────────────────────────────

export type RoutineWindow = 'fixed' | 'flexible' | 'anytime' | 'multi'

export interface Routine {
  id: string
  title: string
  category: string
  profile: Profile
  windowType: RoutineWindow
  /** "06:00" 24h local time */
  windowStart: string | null
  windowEnd: string | null
  /** 0 = Sunday … 6 = Saturday */
  repeatDays: number[]
  reminderEnabled: boolean
  createdAt: Timestamp
  /** maintained transactionally on this doc — not recomputed from logs on read */
  currentStreak: number
  longestStreak: number
  /** "2026-07-22" local date string */
  lastCompletedDate: string | null
  /** ADDED beyond DATA_MODEL.md — target completions/day for windowType "multi". */
  targetCount?: number | null
}

// ── /users/{uid}/routineLogs/{routineId}_{date} ──────────────────────────────

export type RoutineLogStatus = 'done' | 'missed'

export interface RoutineLog {
  id: string
  routineId: string
  /** "2026-07-22" — embedded in the doc id */
  date: string
  status: RoutineLogStatus
  /** CLIENT-set timestamp */
  completedAt: Timestamp | null
  /** ADDED beyond DATA_MODEL.md — progress toward targetCount for "multi". */
  count?: number
}

// ── /users/{uid}/dailyBrief/{date} — unused this build (AI deferred) ─────────
// ── /users/{uid}/pushTokens/{tokenId} — unused this build (FCM deferred) ─────
