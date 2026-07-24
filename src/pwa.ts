import { registerSW } from 'virtual:pwa-register'

/**
 * Register the service worker and keep it fresh.
 *
 * The plugin is in `autoUpdate` mode: when a newer deployed build is found, the
 * new SW activates (skipWaiting + clientsClaim) and the page reloads onto it
 * automatically — no prompt. We additionally force an update check right away
 * on load and hourly, so a long-lived (or offline-then-online) session doesn't
 * stay stuck on a stale build.
 */
export function setupPWA(): void {
  registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return
      // Check for a new version immediately, then periodically.
      void registration.update()
      setInterval(() => void registration.update(), 60 * 60 * 1000)
    },
  })
}
