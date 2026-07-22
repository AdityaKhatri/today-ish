import { collection, doc } from 'firebase/firestore'
import { db } from '@/firebase/config'

/** All personal data is nested under /users/{uid}/… (one rule guards everything). */

export const userDocRef = (uid: string) => doc(db, 'users', uid)

export const tasksCol = (uid: string) => collection(db, 'users', uid, 'tasks')
export const taskDocRef = (uid: string, id: string) => doc(db, 'users', uid, 'tasks', id)

export const routinesCol = (uid: string) => collection(db, 'users', uid, 'routines')
export const routineDocRef = (uid: string, id: string) => doc(db, 'users', uid, 'routines', id)

export const routineLogsCol = (uid: string) => collection(db, 'users', uid, 'routineLogs')
/** Doc id embeds the date so writes are idempotent per routine per day. */
export const routineLogDocRef = (uid: string, routineId: string, date: string) =>
  doc(db, 'users', uid, 'routineLogs', `${routineId}_${date}`)
