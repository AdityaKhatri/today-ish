/**
 * Today-ish — task score calculation.
 *
 * SHARED, pure, dependency-free ON PURPOSE. No React, no Firebase, no `window`,
 * no `Timestamp` — everything is plain numbers (epoch ms) so a future Cloud
 * Function (Blaze plan) can import this EXACT module without a rewrite. Keep it
 * side-effect-free.
 *
 * ── Task scoring model ──────────────────────────────────────────────────────
 *   peak = baseScore × urgencyMultiplier         (frozen at add-time)
 *   live = peak − decayRatePerDay × daysElapsed   (before the deadline)
 *          …then decay ACCELERATES past the deadline, and can go negative.
 *
 *   • baseScore: sub-linear effort curve (NOT linear with minutes).
 *   • urgencyMultiplier (1.0–1.5): from deadline tightness at add-time, FROZEN.
 *   • The live score is ALWAYS recomputed from stored fields + `now`; it is
 *     never persisted as a stale number.
 *   • Completing a task locks in whatever `live` was at that instant
 *     (`scoreAtCompletion`), timestamped client-side.
 *
 * NOTE: the tunable constants below (urgency thresholds, decay derivation,
 * post-deadline acceleration) are my reading of the brief + mockups and are
 * pending reconciliation with DATA_MODEL.md. The *shape* of the API is stable;
 * only the numbers may shift.
 */

const DAY_MS = 24 * 60 * 60 * 1000
const HOUR_MS = 60 * 60 * 1000

// ── Effort → base score (sub-linear) ─────────────────────────────────────────
// The schema stores `effortMinutes` (5, 15, 30, 60). The curve is sub-linear:
// doubling+ the minutes does NOT double the score.

export interface EffortOption {
  minutes: number
  label: string
}

export const EFFORT_OPTIONS: readonly EffortOption[] = [
  { minutes: 5, label: '5min' },
  { minutes: 15, label: '15min' },
  { minutes: 30, label: '30min' },
  { minutes: 60, label: '1hr+' },
] as const

export function baseScoreForEffortMinutes(minutes: number): number {
  if (minutes >= 60) return 90
  if (minutes >= 30) return 50
  if (minutes >= 15) return 35
  return 20
}

/** Human label for a stored `effortMinutes` value. */
export function effortLabel(minutes: number): string {
  return minutes >= 60 ? '1hr+' : `${minutes}min`
}

// ── Urgency multiplier (frozen at add-time) ──────────────────────────────────

export const MIN_URGENCY = 1.0
export const MAX_URGENCY = 1.5

/**
 * How tight is the deadline at the moment the task is created? Tighter → higher
 * multiplier, clamped to [1.0, 1.5]. Frozen once set (stored on the task doc);
 * never recomputed on read.
 */
export function urgencyMultiplierForDeadline(nowMs: number, deadlineMs: number): number {
  const hours = (deadlineMs - nowMs) / HOUR_MS
  if (hours <= 24) return 1.5 // due today
  if (hours <= 48) return 1.3 // due tomorrow
  if (hours <= 72) return 1.15 // within ~3 days
  return 1.0 // this week or later
}

// ── Peak (frozen) ─────────────────────────────────────────────────────────────

/** The full value of the task the day it's created: baseScore × urgencyMultiplier. */
export function peakScore(baseScore: number, urgencyMultiplier: number): number {
  return Math.round(baseScore * urgencyMultiplier)
}

// ── Suggested decay rate (derived at add-time, then stored) ──────────────────

/** Fraction of peak bled per day, pre-deadline. Anchored so 30min/×1.0 ≈ −3/day. */
export const DECAY_FRACTION_PER_DAY = 0.06

/**
 * Suggested per-day bleed to store on the task at creation. Higher peak /
 * tighter deadline → faster bleed. Stored (frozen) so live score stays a pure
 * function of stored fields + now.
 */
export function suggestedDecayRatePerDay(baseScore: number, urgencyMultiplier: number): number {
  const peak = peakScore(baseScore, urgencyMultiplier)
  return Math.max(1, Math.round(peak * DECAY_FRACTION_PER_DAY * urgencyMultiplier))
}

// ── Live score ────────────────────────────────────────────────────────────────

/** Past the deadline, decay runs this many times faster. */
export const POST_DEADLINE_ACCELERATION = 3

export interface LiveScoreInput {
  /** baseScore × urgencyMultiplier, frozen at add-time. */
  peak: number
  decayRatePerDay: number
  /** epoch ms */
  createdAt: number
  /** epoch ms */
  deadline: number
  /** epoch ms */
  now: number
}

/**
 * The current score. Decays linearly at `decayRatePerDay` from creation, then
 * accelerates once past the deadline. Can go negative.
 */
export function liveScore({
  peak,
  decayRatePerDay,
  createdAt,
  deadline,
  now,
}: LiveScoreInput): number {
  const daysElapsed = Math.max(0, (now - createdAt) / DAY_MS)
  const daysPastDeadline = Math.max(0, (now - deadline) / DAY_MS)
  const normalDecay = decayRatePerDay * daysElapsed
  const acceleratedExtra = decayRatePerDay * (POST_DEADLINE_ACCELERATION - 1) * daysPastDeadline
  return Math.round(peak - normalDecay - acceleratedExtra)
}

/** Points lost per day at `now` — the "−X/day" bleed label. */
export function dailyBleed(decayRatePerDay: number, deadline: number, now: number): number {
  return now >= deadline ? decayRatePerDay * POST_DEADLINE_ACCELERATION : decayRatePerDay
}

// ── Urgency tier (drives the colored dot) ────────────────────────────────────

export type UrgencyTier = 'red' | 'amber' | 'green'

/** red = overdue / negative, amber = due within 24h, green = healthy / later. */
export function urgencyTier(deadline: number, now: number, live: number): UrgencyTier {
  if (live < 0 || now > deadline) return 'red'
  const hoursUntil = (deadline - now) / HOUR_MS
  if (hoursUntil <= 24) return 'amber'
  return 'green'
}
