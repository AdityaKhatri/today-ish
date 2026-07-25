/**
 * "Keep-alive" hack: Periodic Background Sync.
 *
 * On Chromium/Android with the PWA installed, the browser can wake the service
 * worker on a coarse schedule (browser-throttled, typically ~hours, tied to site
 * engagement) even when the app is fully closed. We register it and stash a
 * small "pending tasks" summary in the Cache so the SW can show a relevant
 * notification without any server.
 *
 * NOT supported on iOS/Safari — there is no way to run background code there; a
 * push server (FCM/Blaze) is the only path to closed-app notifications on iOS.
 */

const STATE_CACHE = 'today-ish-reminder-state'
const STATE_URL = '/reminder-state'
const SYNC_TAG = 'today-ish-reminders'

interface PeriodicSyncRegistration extends ServiceWorkerRegistration {
  periodicSync?: {
    register: (tag: string, options: { minInterval: number }) => Promise<void>
  }
}

export async function registerPeriodicReminders(): Promise<void> {
  try {
    if (!('serviceWorker' in navigator)) return
    const reg = (await navigator.serviceWorker.ready) as PeriodicSyncRegistration
    if (!reg.periodicSync) return
    const status = await navigator.permissions.query({
      // periodic-background-sync isn't in the TS PermissionName union yet
      name: 'periodic-background-sync' as PermissionName,
    })
    if (status.state !== 'granted') return
    await reg.periodicSync.register(SYNC_TAG, { minInterval: 3 * 60 * 60 * 1000 }) // ~3h floor
  } catch {
    /* unsupported / denied — best effort only */
  }
}

/** Stash the current pending summary where the SW can read it when it wakes. */
export async function writeReminderState(
  pendingCount: number,
  topTitle: string | null,
): Promise<void> {
  try {
    if (typeof caches === 'undefined') return
    const cache = await caches.open(STATE_CACHE)
    await cache.put(
      STATE_URL,
      new Response(JSON.stringify({ pendingCount, topTitle }), {
        headers: { 'content-type': 'application/json' },
      }),
    )
  } catch {
    /* ignore */
  }
}
