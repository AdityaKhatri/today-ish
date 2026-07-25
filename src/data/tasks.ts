import {
  Timestamp,
  addDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
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

/**
 * Live subscription to ALL of the user's tasks (active + completed). Screens
 * filter by status locally — Home shows only active; Tasks can show completed
 * via its Status filter.
 */
export function subscribeTasks(
  uid: string,
  cb: (tasks: Task[]) => void,
  onError?: (e: FirestoreError) => void,
): () => void {
  return onSnapshot(
    tasksCol(uid),
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

export interface UpdateTaskInput {
  title: string
  notes: string | null
  category: string
  profile: Profile
  effortMinutes: number
  deadline: Date | null
}

/** Edit a task. Re-derives the frozen scoring fields from the new effort/deadline. */
export async function updateTask(
  uid: string,
  taskId: string,
  input: UpdateTaskInput,
): Promise<void> {
  const now = Date.now()
  const deadlineMs = input.deadline ? input.deadline.getTime() : null
  const baseScore = baseScoreForEffortMinutes(input.effortMinutes)
  const urgencyMultiplier = deadlineMs ? urgencyMultiplierForDeadline(now, deadlineMs) : 1.0
  const decayRatePerDay = suggestedDecayRatePerDay(baseScore, urgencyMultiplier)
  await updateDoc(taskDocRef(uid, taskId), {
    title: input.title.trim(),
    notes: input.notes?.trim() || null,
    category: input.category,
    profile: input.profile,
    effortMinutes: input.effortMinutes,
    deadline: deadlineMs ? Timestamp.fromMillis(deadlineMs) : null,
    baseScore,
    urgencyMultiplier,
    decayRatePerDay,
  })
}

/**
 * Toggle a task between completed and active.
 *
 * Completing locks in the live score at THIS instant and stamps a CLIENT
 * timestamp (never serverTimestamp) so an offline completion credits the right
 * score against the decay curve when it later syncs. Reopening clears both, and
 * refreshes completedAt-as-a-change-marker is NOT needed (status flips it back).
 */
export async function setTaskCompleted(uid: string, task: Task, completed: boolean): Promise<void> {
  if (completed) {
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
      completedAt: Timestamp.now(), // CLIENT clock at the tap; also the 24h "recently changed" marker
      scoreAtCompletion,
    })
  } else {
    // Reopened tasks are active, so they always show on Home/Tasks anyway.
    await updateDoc(taskDocRef(uid, task.id), {
      status: 'active',
      completedAt: null,
      scoreAtCompletion: null,
    })
  }
}

/** Convenience: complete a task (used by the detail screen's button). */
export async function completeTask(uid: string, task: Task): Promise<void> {
  return setTaskCompleted(uid, task, true)
}

export async function deleteTask(uid: string, id: string): Promise<void> {
  await deleteDoc(taskDocRef(uid, id))
}
