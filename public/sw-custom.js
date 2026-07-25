/* Custom service-worker logic, imported into the generated Workbox SW
 * (see vite.config.ts → workbox.importScripts). Handles Periodic Background
 * Sync: when the browser wakes the SW, read the cached pending summary the app
 * left behind and show a reminder — even if the app is closed (Android/Chrome).
 */
/* global self, caches */

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'today-ish-reminders') {
    event.waitUntil(showPendingReminder())
  }
})

async function showPendingReminder() {
  try {
    const cache = await caches.open('today-ish-reminder-state')
    const res = await cache.match('/reminder-state')
    if (!res) return
    const { pendingCount, topTitle } = await res.json()
    if (!pendingCount || pendingCount < 1) return
    const body =
      pendingCount === 1 && topTitle
        ? `1 task pending: ${topTitle}`
        : `${pendingCount} tasks pending — open Today-ish`
    await self.registration.showNotification('Today-ish', {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'periodic-reminder',
    })
  } catch {
    /* ignore */
  }
}
