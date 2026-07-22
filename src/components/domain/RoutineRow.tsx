import { CheckIcon } from '@/components/icons'
import { cn } from '@/lib/cn'
import type { RoutineView } from '@/lib/views'
import styles from './RoutineRow.module.css'

/**
 * A routine row. A missed routine is NEUTRAL — dashed gray ring, faint title,
 * "resets tomorrow" — never a red penalty. Tapping toggles the day's status.
 */
export function RoutineRow({ routine, onToggle }: { routine: RoutineView; onToggle?: () => void }) {
  const { status, title, sub } = routine
  return (
    <button type="button" className={styles.row} onClick={onToggle}>
      {status === 'done' && (
        <span className={cn(styles.mark, styles.done)}>
          <CheckIcon size={12} />
        </span>
      )}
      {status === 'pending' && <span className={cn(styles.mark, styles.pending)} />}
      {status === 'missed' && <span className={cn(styles.mark, styles.missed)} />}
      <div className={styles.body}>
        <div
          className={cn(
            styles.title,
            status === 'done' && styles.titleDone,
            status === 'missed' && styles.titleMissed,
          )}
        >
          {title}
        </div>
        <div className={styles.sub}>{sub}</div>
      </div>
    </button>
  )
}
