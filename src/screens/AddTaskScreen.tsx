import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TaskChips } from '@/components/domain/TaskChips'
import type { TaskChipsValue } from '@/components/domain/TaskChips'
import { Screen } from '@/components/layout/Screen'
import { Button } from '@/components/ui/Button'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { useData } from '@/data/DataProvider'
import { deadlineToDate, defaultPickedISO } from '@/lib/taskForm'
import { useIsDesktop } from '@/state/useMediaQuery'
import { useProfile } from '@/state/ProfileContext'
import styles from './AddTaskScreen.module.css'

export function AddTaskScreen() {
  const navigate = useNavigate()
  const { activeProfile } = useProfile()
  const { createTask } = useData()
  const isDesktop = useIsDesktop()

  const titleRef = useRef<HTMLTextAreaElement>(null)
  const [step, setStep] = useState<1 | 2>(1)
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [category, setCategory] = useState('')
  const [chips, setChips] = useState<TaskChipsValue>({
    profile: activeProfile,
    deadline: 'today',
    pickedISO: defaultPickedISO(),
    effortMinutes: 30,
  })
  const patch = (p: Partial<TaskChipsValue>) => setChips((c) => ({ ...c, ...p }))

  useEffect(() => {
    titleRef.current?.focus()
  }, [step])

  const canSave = title.trim().length > 0

  function handleSave() {
    void createTask({
      title,
      notes: notes.trim() || null,
      category: category.trim() || chips.profile,
      profile: chips.profile,
      effortMinutes: chips.effortMinutes,
      deadline: deadlineToDate(chips.deadline, chips.pickedISO),
    })
    navigate('/tasks')
  }

  // ── Desktop: everything on one page ──
  if (isDesktop) {
    return (
      <Screen
        contentClassName={styles.content}
        footer={
          <div className={styles.footerPad}>
            <Button fullWidth disabled={!canSave} onClick={handleSave}>
              Save task
            </Button>
          </div>
        }
      >
        <div className={styles.header}>
          <button className={styles.cancel} onClick={() => navigate(-1)}>
            Cancel
          </button>
          <div className={styles.step}>New task</div>
        </div>
        <textarea
          ref={titleRef}
          className={styles.titleInput}
          placeholder="What needs doing?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className={styles.notesInput}
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

  // ── Mobile: two-step flow ──
  if (step === 1) {
    return (
      <Screen
        contentClassName={styles.content}
        footer={
          <div className={styles.footerPad}>
            <Button fullWidth disabled={!canSave} onClick={() => setStep(2)}>
              Next
            </Button>
            <button
              className={styles.saveNow}
              disabled={!canSave}
              onClick={handleSave}
              style={{ opacity: canSave ? 1 : 0.4 }}
            >
              or just save it now →
            </button>
          </div>
        }
      >
        <div className={styles.header}>
          <button className={styles.cancel} onClick={() => navigate(-1)}>
            Cancel
          </button>
          <div className={styles.step}>1 of 2</div>
        </div>
        <textarea
          ref={titleRef}
          className={styles.titleInput}
          placeholder="What needs doing?"
          value={title}
          autoFocus
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className={styles.notesInput}
          placeholder="Add a note (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Screen>
    )
  }

  return (
    <Screen
      contentClassName={styles.content}
      footer={
        <div className={styles.footerPad}>
          <Button fullWidth disabled={!canSave} onClick={handleSave}>
            Save task
          </Button>
        </div>
      }
    >
      <div className={styles.header}>
        <button className={styles.cancel} onClick={() => setStep(1)}>
          ← Back
        </button>
        <div className={styles.step}>2 of 2</div>
      </div>
      <TaskChips value={chips} onChange={patch} />
    </Screen>
  )
}
