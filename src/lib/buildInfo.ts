/** Build metadata injected at build time (see vite.config.ts `define`). */
export const BUILD = {
  commit: __BUILD_COMMIT__,
  message: __BUILD_MESSAGE__,
  time: __BUILD_TIME__,
}

/** Human-readable local build date + time, e.g. "Jul 25, 2026, 3:14 PM". */
export function buildDateLabel(): string {
  if (!BUILD.time) return '—'
  const d = new Date(BUILD.time)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}
