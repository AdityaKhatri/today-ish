import { useCallback, useEffect, useState } from 'react'
import {
  isRemindersOn,
  notifPermission,
  requestReminders,
  setRemindersPref,
} from '@/lib/reminders'
import type { NotifPermission } from '@/lib/reminders'

export interface RemindersState {
  permission: NotifPermission
  enabled: boolean
  /** Request permission (via the browser dialog) and turn reminders on. */
  enable: () => Promise<NotifPermission>
  /** Turn reminders off (keeps the browser permission, just stops firing). */
  disable: () => void
}

export function useReminders(): RemindersState {
  const [permission, setPermission] = useState<NotifPermission>(() => notifPermission())
  const [enabled, setEnabled] = useState<boolean>(() => isRemindersOn())

  useEffect(() => {
    const refresh = () => {
      setPermission(notifPermission())
      setEnabled(isRemindersOn())
    }
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.removeEventListener('focus', refresh)
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

  return { permission, enabled, enable, disable }
}
