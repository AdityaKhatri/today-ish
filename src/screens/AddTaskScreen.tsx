import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Screen } from '@/components/layout/Screen'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ChoiceChip } from '@/components/ui/ChoiceChip'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { useData } from '@/data/DataProvider'
import { localDateKey } from '@/lib/dates'
import {
  EFFORT_OPTIONS,
  baseScoreForEffortMinutes,
  peakScore,
  suggestedDecayRatePerDay,
  urgencyMultiplierForDeadline,
} from '@/lib/scoring'
import type { Profile } from '@/types/models'
import { useShowScores } from '@/state/PreferencesContext'
import { useProfile } from '@/state/ProfileContext'
import styles from './AddTaskScreen.module.css'

type DeadlineChoice = 'today' | 'tomorrow' | 'week' | 'pick'

const DEADLINE_OPTIONS: ReadonlyArray<{ value: DeadlineChoice; label: string }> = [
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'week', label: 'This week' },
  { value: 'pick', label: 'Pick date' },
]

const DEADLINE_PHRASE: Record<DeadlineChoice, string> = {
  today: 'same-day',
  tomorrow: 'tomorrow',
  week: 'this-week',
  pick: 'chosen',
}

function endOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(23, 59, 59, 0)
  return x
}

function deadlineToDate(choice: DeadlineChoice, pickedISO: string): Date {
  const now = new Date()
  if (choice === 'today') return endOfDay(now)
  if (choice === 'tomorrow') return endOfDay(new Date(now.getTime() + 86_400_000))
  if (choice === 'week') return endOfDay(new Date(now.getTime() + 7 * 86_400_000))
  return endOfDay(pickedISO ? new Date(`${pickedISO}T23:59:59`) : new Date(now.getTime() + 3 * 86_400_000))
}

export function AddTaskScreen() {
  const navigate = useNavigate()
  const { activeProfile } = useProfile()
  const { createTask } = useData()
  const showScores = useShowScores()

  const titleRef = useRef<HTMLTextAreaElement>(null)
  const [step, setStep] = useState<1 | 2>(1)
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [profile, setProfile] = useState<Profile>(activeProfile)
  const [deadline, setDeadline] = useState<DeadlineChoice>('today')
  // Default to a real date so the picker is never blank when "Pick date" is chosen.
  const [pickedISO, setPickedISO] = useState(() =>
    localDateKey(new Date(Date.now() + 3 * 86_400_000)),
  )
  const [effortMinutes, setEffortMinutes] = useState(30)

  // Open the keyboard immediately on the "what needs doing?" field.
  useEffect(() => {
    if (step === 1) titleRef.current?.focus()
  }, [step])

  const preview = useMemo(() => {
    const now = Date.now()
    const deadlineMs = deadlineToDate(deadline, pickedISO).getTime()
    const base = baseScoreForEffortMinutes(effortMinutes)
    const urgency = urgencyMultiplierForDeadline(now, deadlineMs)
    return {
      peak: peakScore(base, urgency),
      decay: suggestedDecayRatePerDay(base, urgency),
      urgency,
    }
  }, [deadline, pickedISO, effortMinutes])

  const canSave = title.trim().length > 0

  function handleSave() {
    // Instant-optimistic: fire the write (local cache reflects it immediately)
    // and return to the list. baseScore/urgency/decay are frozen at add-time.
    void createTask({
      title,
      notes: notes.trim() || null,
      category: profile, // free-ish; defaults to the profile until a category picker exists
      profile,
      effortMinutes,
      deadline: deadlineToDate(deadline, pickedISO),
    })
    navigate('/tasks')
  }

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

      <SectionLabel className={styles.label}>Profile</SectionLabel>
      <div className={styles.profileRow}>
        <ChoiceChip selected={profile === 'personal'} onClick={() => setProfile('personal')}>
          Personal
        </ChoiceChip>
        <ChoiceChip selected={profile === 'work'} onClick={() => setProfile('work')}>
          Work
        </ChoiceChip>
      </div>

      <SectionLabel className={styles.label}>Deadline</SectionLabel>
      <div className={styles.deadlineGrid}>
        {DEADLINE_OPTIONS.map((opt) => (
          <ChoiceChip
            key={opt.value}
            selected={deadline === opt.value}
            onClick={() => setDeadline(opt.value)}
          >
            {opt.label}
          </ChoiceChip>
        ))}
      </div>
      {deadline === 'pick' && (
        <input
          type="date"
          className={styles.dateInput}
          value={pickedISO}
          onChange={(e) => setPickedISO(e.target.value)}
        />
      )}

      <SectionLabel className={styles.label}>Effort</SectionLabel>
      <div className={styles.effortRow}>
        {EFFORT_OPTIONS.map((o) => (
          <ChoiceChip
            key={o.minutes}
            selected={effortMinutes === o.minutes}
            onClick={() => setEffortMinutes(o.minutes)}
            className={styles.effortChip}
          >
            {o.label}
          </ChoiceChip>
        ))}
      </div>

      {showScores && (
        <Card className={styles.preview}>
          <SectionLabel small>If done today</SectionLabel>
          <div className={styles.previewRow} style={{ marginTop: 8 }}>
            <div className={styles.previewPeak}>+{preview.peak}</div>
            <div className={styles.previewBleed}>−{preview.decay}/day after</div>
          </div>
          <div className={styles.previewSub}>
            {EFFORT_OPTIONS.find((o) => o.minutes === effortMinutes)?.label} effort · urgency ×
            {preview.urgency.toFixed(1)} for a {DEADLINE_PHRASE[deadline]} deadline
          </div>
        </Card>
      )}
    </Screen>
  )
}
