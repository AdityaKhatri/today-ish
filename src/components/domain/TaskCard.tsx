import { UrgencyDot } from '@/components/ui/UrgencyDot'
import { cn } from '@/lib/cn'
import type { TaskView } from '@/lib/views'
import styles from './TaskCard.module.css'

/** Signed score label: "+42" or "−8". */
function scoreLabel(n: number): string {
  return n < 0 ? `−${Math.abs(n)}` : `+${n}`
}

export function TaskCard({ task, onClick }: { task: TaskView; onClick?: () => void }) {
  const positive = task.live >= 0
  return (
    <button type="button" className={styles.card} onClick={onClick}>
      <div className={styles.row}>
        <div className={styles.titleWrap}>
          <UrgencyDot tier={task.tier} />
          <span className={styles.title}>{task.title}</span>
        </div>
        <div className={styles.scoreWrap}>
          <div className={cn(styles.score, positive ? styles.pos : styles.neg)}>
            {scoreLabel(task.live)}
          </div>
          <div className={styles.bleed}>−{task.bleed}/day</div>
        </div>
      </div>
      <div className={styles.meta}>{task.meta}</div>
    </button>
  )
}
