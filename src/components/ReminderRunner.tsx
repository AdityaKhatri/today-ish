import { useEffect } from 'react'
import { useData } from '@/data/DataProvider'
import { alreadyFired, isRemindersOn, markFired, showReminder } from '@/lib/reminders'
import { isRoutineDone, routineActiveOn } from '@/lib/views'
import { useNow } from '@/state/useNow'

const HOUR = 60 * 60 * 1000

/**
 * Fires local reminders while the app is open. Renders nothing. Checks every
 * minute (via useNow) and, when reminders are on, surfaces:
 *   • active tasks that are overdue or due within the next hour
 *   • fixed-time routines whose time has passed and aren't done yet
 * Each reminder fires at most once per day (deduped in localStorage).
 */
export function ReminderRunner() {
  const { tasks, routines, todayLogs, today } = useData()
  const now = useNow(60_000)

  useEffect(() => {
    if (!isRemindersOn()) return

    // Tasks — overdue or due within the hour.
    for (const t of tasks) {
      if (t.status !== 'active' || !t.deadline) continue
      const deadline = t.deadline.toMillis()
      const dueSoonOrOverdue = deadline - now <= HOUR
      if (!dueSoonOrOverdue) continue
      const key = `task:${t.id}`
      if (alreadyFired(today, key)) continue
      markFired(today, key)
      const overdue = now > deadline
      void showReminder(overdue ? 'Task overdue' : 'Task due soon', t.title, key)
    }

    // Routines — fixed-time reached, active today, reminder on, not done.
    const dow = new Date(now).getDay()
    for (const r of routines) {
      if (!r.reminderEnabled || r.windowType !== 'fixed' || !r.windowStart) continue
      if (!routineActiveOn(r, dow)) continue
      const [h, m] = r.windowStart.split(':').map(Number)
      const at = new Date(now)
      at.setHours(h, m, 0, 0)
      if (now < at.getTime()) continue
      if (isRoutineDone(r, todayLogs[r.id])) continue
      const key = `routine:${r.id}`
      if (alreadyFired(today, key)) continue
      markFired(today, key)
      void showReminder('Routine reminder', r.title, key)
    }
  }, [now, tasks, routines, todayLogs, today])

  return null
}
