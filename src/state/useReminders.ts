import { useCallback, useEffect, useState } from 'react'
import {
  getReminderFrequency,
  isRemindersOn,
  notifPermission,
  requestReminders,
  setReminderFrequency,
  setRemindersPref,
} from '@/lib/reminders'
import type { NotifPermission, ReminderFrequency } from '@/lib/reminders'

export interface RemindersState {
  permission: NotifPermission
  enabled: boolean
  frequency: ReminderFrequency
  /** Request permission (via the browser dialog) and turn reminders on. */
  enable: () => Promise<NotifPermission>
  /** Turn reminders off (keeps the browser permission, just stops firing). */
  disable: () => void
  setFrequency: (f: ReminderFrequency) => void
}

export function useReminders(): RemindersState {
  const [permission, setPermission] = useState<NotifPermission>(() => notifPermission())
  const [enabled, setEnabled] = useState<boolean>(() => isRemindersOn())
  const [frequency, setFrequencyState] = useState<ReminderFrequency>(() => getReminderFrequency())

  useEffect(() => {
    const refresh = () => {
      setPermission(notifPermission())
      setEnabled(isRemindersOn())
      setFrequencyState(getReminderFrequency())
    }
    window.addEventListener('focus', refresh)
    window.addEventListener('reminders-changed', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.removeEventListener('focus', refresh)
      window.removeEventListener('reminders-changed', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])

  const enable = useCallback(async () => {
    const res = await requestReminders()
    setPermission(notifPermission())
    setEnabled(isRemindersOn())
    return res
  }, [])

  const disable = useCallback(() => {
    setRemindersPref(false)
    setEnabled(false)
  }, [])

  const setFrequency = useCallback((f: ReminderFrequency) => {
    setReminderFrequency(f)
    setFrequencyState(f)
  }, [])

  return { permission, enabled, frequency, enable, disable, setFrequency }
}
