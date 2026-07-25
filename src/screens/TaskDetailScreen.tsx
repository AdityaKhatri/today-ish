import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckIcon } from '@/components/icons'
import { TaskChips } from '@/components/domain/TaskChips'
import type { TaskChipsValue } from '@/components/domain/TaskChips'
import { Screen } from '@/components/layout/Screen'
import { Button } from '@/components/ui/Button'
import { ConfirmSheet } from '@/components/ui/ConfirmSheet'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { useData } from '@/data/DataProvider'
import { localDateKey } from '@/lib/dates'
import { deadlineToDate, defaultPickedISO } from '@/lib/taskForm'
import styles from './TaskDetailScreen.module.css'

export function TaskDetailScreen() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { tasks, updateTask, setTaskCompleted, deleteTask } = useData()

  const task = tasks.find((t) => t.id === id)

  const [title, setTitle] = useState(() => task?.title ?? '')
  const [notes, setNotes] = useState(() => task?.notes ?? '')
  const [category, setCategory] = useState(() => task?.category ?? '')
  const [chips, setChips] = useState<TaskChipsValue>(() => ({
    profile: task?.profile ?? 'personal',
    deadline: 'pick',
    pickedISO: task?.deadline ? localDateKey(task.deadline.toDate()) : defaultPickedISO(),
    effortMinutes: task?.effortMinutes ?? 30,
  }))
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const patch = (p: Partial<TaskChipsValue>) => setChips((c) => ({ ...c, ...p }))

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

  const isCompleted = task.status === 'completed'
  const canSave = title.trim().length > 0

  function handleSave() {
    void updateTask(task!.id, {
      title,
      notes: notes.trim() || null,
      category: category.trim() || chips.profile,
      profile: chips.profile,
      effortMinutes: chips.effortMinutes,
      deadline: deadlineToDate(chips.deadline, chips.pickedISO),
    })
    navigate('/tasks')
  }

  function handleToggleComplete() {
    void setTaskCompleted(task!, !isCompleted)
    navigate('/tasks')
  }

  function handleDelete() {
    setConfirmingDelete(false)
    void deleteTask(task!.id)
    navigate('/tasks')
  }

  return (
    <Screen
      contentClassName={styles.content}
      overlay={
        <ConfirmSheet
          open={confirmingDelete}
          title="Delete this task?"
          message={`“${task.title}” will be removed. This can’t be undone.`}
          confirmLabel="Delete"
          destructive
          onConfirm={handleDelete}
          onCancel={() => setConfirmingDelete(false)}
        />
      }
      footer={
        <div className={styles.footerPad}>
          <Button fullWidth onClick={handleToggleComplete}>
            {isCompleted ? (
              'Mark not done'
            ) : (
              <>
                <CheckIcon size={16} />
                Mark complete
              </>
            )}
          </Button>
          <button className={styles.deleteBtn} onClick={() => setConfirmingDelete(true)}>
            Delete task
          </button>
        </div>
      }
    >
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate('/tasks')}>
          ← Tasks
        </button>
        <button className={styles.save} disabled={!canSave} onClick={handleSave}>
          Save
        </button>
      </div>

      <textarea
        className={styles.title}
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className={styles.notes}
        placeholder="Add a note (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <SectionLabel className={styles.label}>Category</SectionLabel>
      <input
        className={styles.textInput}
        placeholder="Personal / Work / Errands…"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <TaskChips value={chips} onChange={patch} />
    </Screen>
  )
}
