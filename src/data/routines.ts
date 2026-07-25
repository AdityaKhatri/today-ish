import {
  Timestamp,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import type { FirestoreError } from 'firebase/firestore'
import { routineDocRef, routineLogDocRef, routineLogsCol, routinesCol } from './paths'
import { previousDateKey } from '@/lib/dates'
import { isRoutineDone } from '@/lib/views'
import type { Profile, Routine, RoutineLog, RoutineWindow } from '@/types/models'

export interface NewRoutineInput {
  title: string
  category: string
  profile: Profile
  windowType: RoutineWindow
  windowStart: string | null
  windowEnd: string | null
  repeatDays: number[]
  reminderEnabled: boolean
  targetCount: number | null
}

export function subscribeRoutines(
  uid: string,
  cb: (routines: Routine[]) => void,
  onError?: (e: FirestoreError) => void,
): () => void {
  return onSnapshot(
    routinesCol(uid),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Routine, 'id'>) }))),
    onError,
  )
}

/** Today's logs, keyed by routineId, for the daily view's fast path. */
export function subscribeLogsForDate(
  uid: string,
  date: string,
  cb: (byRoutineId: Record<string, RoutineLog>) => void,
  onError?: (e: FirestoreError) => void,
): () => void {
  const q = query(routineLogsCol(uid), where('date', '==', date))
  return onSnapshot(
    q,
    (snap) => {
      const map: Record<string, RoutineLog> = {}
      for (const d of snap.docs) {
        const log = { id: d.id, ...(d.data() as Omit<RoutineLog, 'id'>) }
        map[log.routineId] = log
      }
      cb(map)
    },
    onError,
  )
}

export async function createRoutine(uid: string, input: NewRoutineInput): Promise<void> {
  await addDoc(routinesCol(uid), {
    title: input.title.trim(),
    category: input.category,
    profile: input.profile,
    windowType: input.windowType,
    windowStart: input.windowStart,
    windowEnd: input.windowEnd,
    repeatDays: input.repeatDays,
    reminderEnabled: input.reminderEnabled,
    createdAt: serverTimestamp(),
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: null,
    targetCount: input.targetCount,
  })
}

export async function updateRoutine(
  uid: string,
  id: string,
  patch: Partial<NewRoutineInput>,
): Promise<void> {
  await updateDoc(routineDocRef(uid, id), patch)
}

export async function deleteRoutine(uid: string, id: string): Promise<void> {
  await deleteDoc(routineDocRef(uid, id))
}

/**
 * Advance a routine's state for `date` on tap.
 *
 * INSTANT-OPTIMISTIC (no transaction — transactions need a server round-trip and
 * fail offline). Plain setDoc/updateDoc/deleteDoc apply to the local cache
 * immediately, reflect in the live subscription right away, and sync later.
 *
 * - Simple routines toggle done ↔ not-done.
 * - "multi" (few-times-a-day) routines ROTATE the count: e.g. target 3 →
 *   1 → 2 → 3 → 0 → 1 … "done" is count ≥ target.
 *
 * Streak counters on the routine doc are maintained best-effort (last-write-wins
 * across devices is fine per the brief). Every tap is timestamped
 * (completedAt/updatedAt) on the routineLog audit doc.
 */
export async function toggleRoutine(
  uid: string,
  routine: Routine,
  date: string,
  currentLog: RoutineLog | undefined,
): Promise<void> {
  const rRef = routineDocRef(uid, routine.id)
  const lRef = routineLogDocRef(uid, routine.id, date)

  const isMulti = routine.windowType === 'multi'
  const target = isMulti ? Math.max(1, routine.targetCount ?? 1) : 1

  const currentCount = currentLog?.count ?? (currentLog?.status === 'done' ? target : 0)
  const nextCount = (currentCount + 1) % (target + 1) // rotate 0..target

  const wasDone = isRoutineDone(routine, currentLog)
  const nowDone = nextCount >= target
  const now = Timestamp.now()

  // eslint-disable-next-line no-console
  console.info('[routine] tap', routine.title, {
    from: currentCount,
    to: nextCount,
    at: now.toDate().toISOString(),
  })

  if (nextCount === 0) {
    await deleteDoc(lRef)
  } else {
    await setDoc(lRef, {
      routineId: routine.id,
      date,
      status: nowDone ? 'done' : 'pending',
      count: nextCount,
      completedAt: now, // CLIENT clock at the tap
      updatedAt: now,
    })
  }

  // Maintain the streak only on the done ↔ not-done transitions.
  if (nowDone && !wasDone) {
    const prev = previousDateKey(date)
    let currentStreak: number
    if (routine.lastCompletedDate === date) currentStreak = routine.currentStreak
    else if (routine.lastCompletedDate === prev) currentStreak = routine.currentStreak + 1
    else currentStreak = 1
    await updateDoc(rRef, {
      currentStreak,
      longestStreak: Math.max(routine.longestStreak ?? 0, currentStreak),
      lastCompletedDate: date,
    })
  } else if (!nowDone && wasDone && routine.lastCompletedDate === date) {
    await updateDoc(rRef, {
      currentStreak: Math.max(0, routine.currentStreak - 1),
      lastCompletedDate: null,
    })
  }
}
