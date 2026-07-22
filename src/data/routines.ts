import {
  Timestamp,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import type { FirestoreError } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { routineDocRef, routineLogDocRef, routineLogsCol, routinesCol } from './paths'
import { previousDateKey } from '@/lib/dates'
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
 * Mark a routine done / not-done for `date`, maintaining streak counters
 * transactionally on the routine doc (the fast-path number the UI reads). The
 * routineLog write is idempotent (doc id embeds the date).
 */
export async function setRoutineDone(
  uid: string,
  routine: Routine,
  date: string,
  done: boolean,
): Promise<void> {
  const rRef = routineDocRef(uid, routine.id)
  const lRef = routineLogDocRef(uid, routine.id, date)

  await runTransaction(db, async (txn) => {
    const rSnap = await txn.get(rRef)
    if (!rSnap.exists()) return
    const r = rSnap.data() as Omit<Routine, 'id'>

    if (done) {
      const prev = previousDateKey(date)
      let currentStreak: number
      if (r.lastCompletedDate === date) currentStreak = r.currentStreak
      else if (r.lastCompletedDate === prev) currentStreak = r.currentStreak + 1
      else currentStreak = 1
      const longestStreak = Math.max(r.longestStreak ?? 0, currentStreak)

      const log: Record<string, unknown> = {
        routineId: routine.id,
        date,
        status: 'done',
        completedAt: Timestamp.now(), // CLIENT clock at the tap
      }
      if (routine.windowType === 'multi') log.count = routine.targetCount ?? 1

      txn.set(lRef, log)
      txn.update(rRef, { currentStreak, longestStreak, lastCompletedDate: date })
    } else {
      // Undo today's completion. Reverting the streak precisely would need the
      // prior completion date; we conservatively step back one and clear the
      // marker (a re-complete re-derives from there).
      txn.delete(lRef)
      const revert = r.lastCompletedDate === date
      txn.update(rRef, {
        currentStreak: revert ? Math.max(0, r.currentStreak - 1) : r.currentStreak,
        lastCompletedDate: revert ? null : r.lastCompletedDate,
      })
    }
  })
}
