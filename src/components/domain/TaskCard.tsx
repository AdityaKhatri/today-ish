import { CheckIcon } from '@/components/icons'
import { cn } from '@/lib/cn'
import { SHOW_SCORES } from '@/lib/features'
import type { UrgencyTier } from '@/lib/scoring'
import type { TaskView } from '@/lib/views'
import styles from './TaskCard.module.css'

const TIER_COLOR: Record<UrgencyTier, string> = {
  red: 'var(--color-red)',
  amber: 'var(--color-amber)',
  green: 'var(--color-green)',
}

function scoreLabel(n: number): string {
  return n < 0 ? `−${Math.abs(n)}` : `+${n}`
}

export function TaskCard({
  task,
  onClick,
  onToggleDone,
  done,
}: {
  task: TaskView
  onClick?: () => void
  onToggleDone?: () => void
  done?: boolean
}) {
  const positive = task.live >= 0
  return (
    <div className={styles.card}>
      <button
        type="button"
        className={cn(styles.check, done && styles.checkDone)}
        // Unchecked: the ring carries the urgency color. Checked: solid green.
        style={done ? undefined : { borderColor: TIER_COLOR[task.tier] }}
        aria-label={done ? 'Mark not done' : 'Mark done'}
        aria-pressed={done}
        onClick={onToggleDone}
      >
        {done && <CheckIcon size={13} />}
      </button>
      <button type="button" className={styles.body} onClick={onClick}>
        <span className={styles.row}>
          <span className={cn(styles.title, done && styles.doneTitle)}>{task.title}</span>
          {SHOW_SCORES && (
            <span className={styles.scoreWrap}>
              <span className={cn(styles.score, positive ? styles.pos : styles.neg)}>
                {scoreLabel(task.live)}
              </span>
              <span className={styles.bleed}>−{task.bleed}/day</span>
            </span>
          )}
        </span>
        <span className={styles.meta}>{task.meta}</span>
      </button>
    </div>
  )
}
