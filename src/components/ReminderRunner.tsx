import { useEffect } from 'react'
import { useData } from '@/data/DataProvider'
import { writeReminderState } from '@/lib/backgroundSync'
import { startOfLocalDay } from '@/lib/dates'
import { pickQuirkyMessage } from '@/lib/quirkyMessages'
import { alreadyFired, getReminderFrequency, isRemindersOn, markFired, showReminder } from '@/lib/reminders'
import { isRoutineDone, routineActiveOn } from '@/lib/views'
import { useNow } from '@/state/useNow'

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

// Daily "pending tasks" digests. Each fires once, when the app is open within a
// 2-hour window after the slot time (so opening late doesn't fire a stale one).
const DIGEST_WINDOW = 2 * HOUR
const DIGEST_SLOTS = [
  { key: 'morning', hour: 9, title: 'Good morning' },
  { key: 'noon', hour: 12, title: 'Midday check-in' },
  { key: 'evening', hour: 18, title: 'Wrapping up the day' },
]

/**
 * Fires local reminders while the app is open. Renders nothing. Checks every
 * minute (via useNow) and, when reminders are on, surfaces:
 *   • active tasks that are overdue or due within the next hour
 *   • fixed-time routines whose time has passed and aren't done yet
 *   • daily digests of pending tasks in the morning, at midday, and end of day
 * Each reminder fires at most once per day (deduped in localStorage).
 */
export function ReminderRunner() {
  const { tasks, routines, todayLogs, today } = useData()
  const now = useNow(60_000)

  useEffect(() => {
    if (!isRemindersOn()) return
    const frequency = getReminderFrequency()

    // Per-task "due soon / overdue" alerts — only on the "high" frequency.
    if (frequency === 'high') {
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

    // Daily digests — pending tasks = active tasks due today/overdue or undated.
    const startOfTomorrow = startOfLocalDay(new Date(now + DAY)).getTime()
    const pending = tasks
      .filter((t) => t.status === 'active' && (!t.deadline || t.deadline.toMillis() < startOfTomorrow))
      .sort((a, b) => (a.deadline?.toMillis() ?? Infinity) - (b.deadline?.toMillis() ?? Infinity))

    // Stash the summary so the background-sync SW can nudge while the app is closed.
    void writeReminderState(pending.length, pending[0]?.title ?? null)

    // "low" = one digest a day (morning only); otherwise all three.
    const slots = frequency === 'low' ? DIGEST_SLOTS.slice(0, 1) : DIGEST_SLOTS
    for (const slot of slots) {
      const at = new Date(now)
      at.setHours(slot.hour, 0, 0, 0)
      const atMs = at.getTime()
      if (now < atMs || now >= atMs + DIGEST_WINDOW) continue

      if (pending.length === 0) {
        // No tasks at all → one quirky, sarcastic nudge a day.
        const key = 'digest:empty'
        if (alreadyFired(today, key)) break
        markFired(today, key)
        void showReminder('Today-ish', pickQuirkyMessage(), key)
        break
      }

      const key = `digest:${slot.key}`
      if (alreadyFired(today, key)) continue
      markFired(today, key)
      const n = pending.length
      const top = pending[0].title
      const body = n === 1 ? `1 task pending: ${top}` : `${n} tasks pending — ${top} +${n - 1} more`
      void showReminder(slot.title, body, key)
    }
  }, [now, tasks, routines, todayLogs, today])

  return null
}
