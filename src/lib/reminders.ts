/**
 * In-app reminders via the Web Notification API.
 *
 * Scope on the Spark plan: these fire while the app is running (foreground or
 * backgrounded-but-alive) on platforms that support the Notification API —
 * Android/Chrome and INSTALLED iOS PWAs (iOS 16.4+). True background push when
 * the app is fully closed needs FCM + a server (the future Blaze build); the
 * plumbing here (permission + enabled state) is what that will reuse.
 */

export type NotifPermission = 'unsupported' | 'default' | 'granted' | 'denied'

export function notifPermission(): NotifPermission {
  if (typeof Notification === 'undefined' || !('serviceWorker' in navigator)) return 'unsupported'
  return Notification.permission as NotifPermission
}

const ENABLED_KEY = 'today-ish.remindersEnabled'

/** On = the user opted in AND the browser permission is still granted. */
export function isRemindersOn(): boolean {
  return localStorage.getItem(ENABLED_KEY) === '1' && notifPermission() === 'granted'
}

export function setRemindersPref(on: boolean): void {
  localStorage.setItem(ENABLED_KEY, on ? '1' : '0')
  // Let the app react (register/refresh the FCM token, update the user doc).
  window.dispatchEvent(new Event('reminders-changed'))
}

/** Request permission (if needed) and record the opt-in. Returns the resulting state. */
export async function requestReminders(): Promise<NotifPermission> {
  const current = notifPermission()
  if (current === 'unsupported') return 'unsupported'
  let res: NotifPermission = current
  if (current === 'default') {
    res = (await Notification.requestPermission()) as NotifPermission
  }
  if (res === 'granted') setRemindersPref(true)
  return res
}

/** Show a system notification via the SW registration (required for installed PWAs / iOS). */
export async function showReminder(title: string, body: string, tag: string): Promise<void> {
  if (notifPermission() !== 'granted') return
  try {
    const reg = await navigator.serviceWorker.ready
    await reg.showNotification(title, {
      body,
      tag,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
    })
  } catch {
    /* best-effort — ignore if the SW isn't ready */
  }
}

// ── Dedupe: only fire each reminder once per day ────────────────────────────

function firedKey(date: string): string {
  return `today-ish.fired.${date}`
}

export function alreadyFired(date: string, id: string): boolean {
  try {
    const set = JSON.parse(localStorage.getItem(firedKey(date)) ?? '[]') as string[]
    return set.includes(id)
  } catch {
    return false
  }
}

export function markFired(date: string, id: string): void {
  try {
    const set = JSON.parse(localStorage.getItem(firedKey(date)) ?? '[]') as string[]
    if (!set.includes(id)) {
      set.push(id)
      localStorage.setItem(firedKey(date), JSON.stringify(set))
    }
  } catch {
    /* ignore */
  }
}
