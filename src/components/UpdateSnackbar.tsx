import { useEffect, useState } from 'react'
import { BUILD } from '@/lib/buildInfo'
import styles from './UpdateSnackbar.module.css'

const KEY = 'today-ish.lastSeenBuild'

/**
 * Shows a small snackbar once when the app opens on a NEWER build than the user
 * last saw (compares the injected build commit against a stored one). Skips the
 * very first ever load. Auto-dismisses.
 */
export function UpdateSnackbar() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const last = localStorage.getItem(KEY)
    localStorage.setItem(KEY, BUILD.commit)
    if (last && last !== BUILD.commit) {
      setShow(true)
      const t = window.setTimeout(() => setShow(false), 6000)
      return () => window.clearTimeout(t)
    }
  }, [])

  if (!show) return null
  return (
    <div className={styles.snack} role="status">
      <span className={styles.text}>Updated to the latest version</span>
      <button className={styles.close} aria-label="Dismiss" onClick={() => setShow(false)}>
        ×
      </button>
    </div>
  )
}
