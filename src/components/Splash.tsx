import { NautilusMark } from '@/components/Logo'
import styles from './Splash.module.css'

/** Shown while auth resolves and the allowlist check runs (before any app screen). */
export function Splash() {
  return (
    <div className={styles.wrap}>
      <span className={styles.mark}>
        <NautilusMark size={64} />
      </span>
    </div>
  )
}
