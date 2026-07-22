import { useEffect, useState } from 'react'

/**
 * A clock that ticks every `intervalMs` (default 60s) so live task scores and
 * bleed rates re-render while the tab is foregrounded. Also ticks immediately
 * on focus / tab-visible so scores are fresh the moment the user returns.
 *
 * This is the "in-app reminder" mechanism for this build: no background push,
 * just live-refreshing urgency while the app is open.
 */
export function useNow(intervalMs = 60_000): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const tick = () => setNow(Date.now())
    const id = window.setInterval(tick, intervalMs)
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', tick)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', tick)
    }
  }, [intervalMs])

  return now
}
