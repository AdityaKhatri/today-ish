import { useNavigate, useParams } from 'react-router-dom'
import { CheckIcon } from '@/components/icons'
import { Screen } from '@/components/layout/Screen'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useData } from '@/data/DataProvider'
import { cn } from '@/lib/cn'
import { relativeDeadlineLabel } from '@/lib/dates'
import { effortLabel } from '@/lib/scoring'
import type { UrgencyTier } from '@/lib/scoring'
import { buildTaskView } from '@/lib/views'
import { useNow } from '@/state/useNow'
import styles from './TaskDetailScreen.module.css'

const SCORE_NOTE: Record<UrgencyTier, string> = {
  red: 'Overdue — bleeding fast',
  amber: 'Decaying soon',
  green: 'Healthy — plenty of runway',
}

export function TaskDetailScreen() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { tasks, completeTask, deleteTask } = useData()
  const now = useNow() // keep the live score fresh

  const task = tasks.find((t) => t.id === id)

  if (!task) {
    return (
      <Screen contentClassName={styles.content}>
        <div className={styles.header}>
          <button className={styles.back} onClick={() => navigate('/tasks')}>
            ← Tasks
          </button>
        </div>
        <div className={styles.notFound}>That task no longer exists.</div>
      </Screen>
    )
  }

  const view = buildTaskView(task, now)
  const positive = view.live >= 0
  const deadlineRaw = task.deadline
    ? relativeDeadlineLabel(task.deadline.toDate(), new Date(now)).replace(/^due /, '')
    : 'no deadline'
  const deadlineText = deadlineRaw.charAt(0).toUpperCase() + deadlineRaw.slice(1)

  function handleComplete() {
    // Instant-optimistic: the local cache reflects the write immediately, and
    // completeTask captures scoreAtCompletion + a client Timestamp at the tap.
    void completeTask(task!)
    navigate('/tasks')
  }

  function handleDelete() {
    if (!window.confirm(`Delete “${task!.title}”?`)) return
    void deleteTask(task!.id)
    navigate('/tasks')
  }

  return (
    <Screen
      contentClassName={styles.content}
      footer={
        <div className={styles.footerPad}>
          <Button fullWidth onClick={handleComplete}>
            <CheckIcon size={16} />
            Mark complete
          </Button>
        </div>
      }
    >
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate('/tasks')}>
          ← Tasks
        </button>
        <button className={styles.delete} onClick={handleDelete}>
          Delete
        </button>
      </div>

      <div className={styles.title}>{task.title}</div>

      <Card className={styles.scoreCard}>
        <div className={styles.scoreRow}>
          <div className={cn(styles.score, positive ? styles.pos : styles.neg)}>
            {positive ? `+${view.live}` : `−${Math.abs(view.live)}`}
          </div>
          <div className={styles.bleed}>−{view.bleed}/day</div>
        </div>
        <div className={styles.scoreNote}>{SCORE_NOTE[view.tier]}</div>
      </Card>

      <div className={styles.row}>
        <div className={styles.rowLabel}>Deadline</div>
        <div className={styles.rowValue}>{deadlineText}</div>
      </div>
      <div className={styles.row}>
        <div className={styles.rowLabel}>Effort</div>
        <div className={styles.rowValue}>{effortLabel(task.effortMinutes)}</div>
      </div>
      {task.notes && (
        <div className={styles.notesBlock}>
          <div className={styles.notesLabel}>Notes</div>
          <div className={styles.notesText}>{task.notes}</div>
        </div>
      )}
    </Screen>
  )
}
