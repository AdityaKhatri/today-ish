import {
  Timestamp,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import type { FirestoreError } from 'firebase/firestore'
import { tasksCol, taskDocRef } from './paths'
import {
  baseScoreForEffortMinutes,
  liveScore,
  peakScore,
  suggestedDecayRatePerDay,
  urgencyMultiplierForDeadline,
} from '@/lib/scoring'
import type { Profile, Task } from '@/types/models'

export interface NewTaskInput {
  title: string
  notes: string | null
  category: string
  profile: Profile
  effortMinutes: number
  deadline: Date | null
}

/** Live subscription to the user's ACTIVE tasks (completed are kept as history). */
export function subscribeTasks(
  uid: string,
  cb: (tasks: Task[]) => void,
  onError?: (e: FirestoreError) => void,
): () => void {
  const q = query(tasksCol(uid), where('status', '==', 'active'))
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Task, 'id'>) }))),
    onError,
  )
}

export async function createTask(uid: string, input: NewTaskInput): Promise<void> {
  const now = Date.now()
  const deadlineMs = input.deadline ? input.deadline.getTime() : null
  const baseScore = baseScoreForEffortMinutes(input.effortMinutes)
  // urgency frozen at add-time; no deadline → neutral 1.0
  const urgencyMultiplier = deadlineMs ? urgencyMultiplierForDeadline(now, deadlineMs) : 1.0
  const decayRatePerDay = suggestedDecayRatePerDay(baseScore, urgencyMultiplier)

  await addDoc(tasksCol(uid), {
    title: input.title.trim(),
    notes: input.notes?.trim() || null,
    category: input.category,
    profile: input.profile,
    status: 'active',
    createdAt: serverTimestamp(), // server ts is fine for createdAt (per data model)
    deadline: deadlineMs ? Timestamp.fromMillis(deadlineMs) : null,
    effortMinutes: input.effortMinutes,
    baseScore,
    urgencyMultiplier,
    decayRatePerDay,
    completedAt: null,
    scoreAtCompletion: null,
  })
}

/**
 * Complete a task: lock in the live score at THIS instant and stamp a CLIENT
 * timestamp (never serverTimestamp) so an offline completion credits the right
 * score against the decay curve when it later syncs.
 */
export async function completeTask(uid: string, task: Task): Promise<void> {
  const now = Date.now()
  const peak = peakScore(task.baseScore, task.urgencyMultiplier)
  const deadlineMs = task.deadline ? task.deadline.toMillis() : Number.POSITIVE_INFINITY
  const createdMs = task.createdAt ? task.createdAt.toMillis() : now
  const scoreAtCompletion = liveScore({
    peak,
    decayRatePerDay: task.decayRatePerDay,
    createdAt: createdMs,
    deadline: deadlineMs,
    now,
  })
  await updateDoc(taskDocRef(uid, task.id), {
    status: 'completed',
    completedAt: Timestamp.now(),
    scoreAtCompletion,
  })
}

export async function deleteTask(uid: string, id: string): Promise<void> {
  await deleteDoc(taskDocRef(uid, id))
}
