import { useNavigate, useParams } from 'react-router-dom'
import { CheckIcon } from '@/components/icons'
import { Screen } from '@/components/layout/Screen'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/cn'
import { MOCK_TASKS } from '@/mock/fixtures'
import { useNow } from '@/state/useNow'
import styles from './TaskDetailScreen.module.css'

export function TaskDetailScreen() {
  const navigate = useNavigate()
  const { id } = useParams()
  useNow() // keep the live score fresh

  const task = MOCK_TASKS.find((t) => t.id === id)

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

  const positive = task.live >= 0

  function handleComplete() {
    // Instant-optimistic + offline-correct: capture scoreAtCompletion = live NOW
    // and a client Timestamp.now() at the tap. (Firestore write lands with the
    // data layer.)
    console.info('[today-ish] completeTask (not yet persisted)', {
      id: task!.id,
      scoreAtCompletion: task!.live,
      completedAt: new Date().toISOString(),
    })
    navigate('/tasks')
  }

  function handleDelete() {
    if (!window.confirm(`Delete “${task!.title}”?`)) return
    console.info('[today-ish] deleteTask (not yet persisted)', { id: task!.id })
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
            {positive ? `+${task.live}` : `−${Math.abs(task.live)}`}
          </div>
          <div className={styles.bleed}>−{task.bleed}/day</div>
        </div>
        <div className={styles.scoreNote}>{task.scoreNote}</div>
      </Card>

      <div className={styles.row}>
        <div className={styles.rowLabel}>Deadline</div>
        <div className={styles.rowValue}>{task.deadlineText}</div>
      </div>
      <div className={styles.row}>
        <div className={styles.rowLabel}>Effort</div>
        <div className={styles.rowValue}>{task.effort}</div>
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
