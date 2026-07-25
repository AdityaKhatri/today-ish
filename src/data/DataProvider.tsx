import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { setDoc } from 'firebase/firestore'
import { useAuth } from '@/auth/useAuth'
import { registerPeriodicReminders } from '@/lib/backgroundSync'
import { localDateKey } from '@/lib/dates'
import { registerFcmToken, setupForegroundMessages } from '@/lib/fcm'
import { isRemindersOn } from '@/lib/reminders'
import { useNow } from '@/state/useNow'
import type { Routine, RoutineLog, Task } from '@/types/models'
import { userDocRef } from './paths'
import {
  createTask as createTaskFn,
  deleteTask as deleteTaskFn,
  setTaskCompleted as setTaskCompletedFn,
  subscribeTasks,
} from './tasks'
import type { NewTaskInput } from './tasks'
import {
  createRoutine as createRoutineFn,
  deleteRoutine as deleteRoutineFn,
  subscribeLogsForDate,
  subscribeRoutines,
  toggleRoutine as toggleRoutineFn,
  updateRoutine as updateRoutineFn,
} from './routines'
import type { NewRoutineInput } from './routines'

interface DataContextValue {
  loading: boolean
  error: string | null
  /** Local-date key, rolls over at midnight while the app is open. */
  today: string
  tasks: Task[]
  routines: Routine[]
  todayLogs: Record<string, RoutineLog>
  createTask: (input: NewTaskInput) => Promise<void>
  setTaskCompleted: (task: Task, completed: boolean) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  createRoutine: (input: NewRoutineInput) => Promise<void>
  updateRoutine: (id: string, patch: Partial<NewRoutineInput>) => Promise<void>
  deleteRoutine: (id: string) => Promise<void>
  toggleRoutine: (routine: Routine) => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

/** Mounted only for authenticated + allowlisted users (so `uid` is always set). */
export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const uid = user?.uid ?? null
  const now = useNow(60_000)
  const today = localDateKey(new Date(now))

  const [tasks, setTasks] = useState<Task[]>([])
  const [routines, setRoutines] = useState<Routine[]>([])
  const [todayLogs, setTodayLogs] = useState<Record<string, RoutineLog>>({})
  const [tasksLoaded, setTasksLoaded] = useState(false)
  const [routinesLoaded, setRoutinesLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!uid) return
    setTasksLoaded(false)
    return subscribeTasks(
      uid,
      (t) => {
        setTasks(t)
        setTasksLoaded(true)
      },
      (e) => setError(e.message),
    )
  }, [uid])

  useEffect(() => {
    if (!uid) return
    setRoutinesLoaded(false)
    return subscribeRoutines(
      uid,
      (r) => {
        setRoutines(r)
        setRoutinesLoaded(true)
      },
      (e) => setError(e.message),
    )
  }, [uid])

  useEffect(() => {
    if (!uid) return
    return subscribeLogsForDate(uid, today, setTodayLogs, (e) => setError(e.message))
  }, [uid, today])

  // FCM: register/refresh the push token and mirror the reminder preference +
  // timezone onto the user doc so the (Blaze) Cloud Function can send correctly.
  useEffect(() => {
    if (!uid) return
    void setupForegroundMessages()
    const sync = () => {
      const on = isRemindersOn()
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      void setDoc(userDocRef(uid), { remindersEnabled: on, timezone: tz }, { merge: true }).catch(
        () => {},
      )
      if (on) {
        void registerFcmToken(uid)
        void registerPeriodicReminders()
      }
    }
    sync()
    const onFocus = () => {
      if (isRemindersOn()) void registerFcmToken(uid)
    }
    window.addEventListener('reminders-changed', sync)
    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener('reminders-changed', sync)
      window.removeEventListener('focus', onFocus)
    }
  }, [uid])

  const value = useMemo<DataContextValue>(
    () => ({
      loading: !tasksLoaded || !routinesLoaded,
      error,
      today,
      tasks,
      routines,
      todayLogs,
      createTask: (input) => createTaskFn(uid!, input),
      setTaskCompleted: (task, completed) => setTaskCompletedFn(uid!, task, completed),
      deleteTask: (id) => deleteTaskFn(uid!, id),
      createRoutine: (input) => createRoutineFn(uid!, input),
      updateRoutine: (id, patch) => updateRoutineFn(uid!, id, patch),
      deleteRoutine: (id) => deleteRoutineFn(uid!, id),
      toggleRoutine: (routine) => toggleRoutineFn(uid!, routine, today, todayLogs[routine.id]),
    }),
    [uid, tasksLoaded, routinesLoaded, error, today, tasks, routines, todayLogs],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within <DataProvider>')
  return ctx
}
