import { useOnline } from '@/state/useOnline'
import styles from './OfflineBadge.module.css'

/** "Offline · syncing later" pill — only shown when actually offline. */
export function OfflineBadge() {
  const online = useOnline()
  if (online) return null
  return (
    <span className={styles.badge}>
      <span className={styles.dot} />
      Offline · syncing later
    </span>
  )
}
