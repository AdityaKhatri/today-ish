import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Screen } from '@/components/layout/Screen'
import { Button } from '@/components/ui/Button'
import { ChoiceChip } from '@/components/ui/ChoiceChip'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { Card } from '@/components/ui/Card'
import {
  EFFORTS,
  baseScoreForEffort,
  peakScore,
  suggestedDecayRatePerDay,
  urgencyMultiplierForDeadline,
} from '@/lib/scoring'
import type { Effort } from '@/lib/scoring'
import type { Profile } from '@/types/models'
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

function deadlineToMs(choice: DeadlineChoice, pickedISO: string): number {
  const now = new Date()
  if (choice === 'today') return endOfDay(now).getTime()
  if (choice === 'tomorrow') return endOfDay(new Date(now.getTime() + 86_400_000)).getTime()
  if (choice === 'week') return endOfDay(new Date(now.getTime() + 7 * 86_400_000)).getTime()
  // pick
  const picked = pickedISO ? new Date(`${pickedISO}T23:59:59`) : new Date(now.getTime() + 3 * 86_400_000)
  return endOfDay(picked).getTime()
}

export function AddTaskScreen() {
  const navigate = useNavigate()
  const { activeProfile } = useProfile()

  const [step, setStep] = useState<1 | 2>(1)
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [profile, setProfile] = useState<Profile>(activeProfile)
  const [deadline, setDeadline] = useState<DeadlineChoice>('today')
  const [pickedISO, setPickedISO] = useState('')
  const [effort, setEffort] = useState<Effort>('30min')

  const preview = useMemo(() => {
    const now = Date.now()
    const deadlineMs = deadlineToMs(deadline, pickedISO)
    const base = baseScoreForEffort(effort)
    const urgency = urgencyMultiplierForDeadline(now, deadlineMs)
    return {
      peak: peakScore(base, urgency),
      decay: suggestedDecayRatePerDay(base, urgency),
      urgency,
    }
  }, [deadline, pickedISO, effort])

  function handleSave() {
    // TODO(data layer — blocked on DATA_MODEL.md/firestore.rules):
    // persist to /users/{uid}/tasks with FROZEN baseScore, urgencyMultiplier,
    // decayRatePerDay and a client-side createdAt Timestamp. Until then this is
    // a no-op that returns to the list.
    console.info('[today-ish] createTask (not yet persisted)', {
      title,
      notes,
      profile,
      effort,
      deadlineMs: deadlineToMs(deadline, pickedISO),
      baseScore: baseScoreForEffort(effort),
      urgencyMultiplier: preview.urgency,
      decayRatePerDay: preview.decay,
    })
    navigate('/tasks')
  }

  const canSave = title.trim().length > 0

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
        {EFFORTS.map((e) => (
          <ChoiceChip
            key={e}
            selected={effort === e}
            onClick={() => setEffort(e)}
            className={styles.effortChip}
          >
            {e}
          </ChoiceChip>
        ))}
      </div>

      <Card className={styles.preview}>
        <SectionLabel small>If done today</SectionLabel>
        <div className={styles.previewRow} style={{ marginTop: 8 }}>
          <div className={styles.previewPeak}>+{preview.peak}</div>
          <div className={styles.previewBleed}>−{preview.decay}/day after</div>
        </div>
        <div className={styles.previewSub}>
          {effort} effort · urgency ×{preview.urgency.toFixed(1)} for a{' '}
          {DEADLINE_PHRASE[deadline]} deadline
        </div>
      </Card>
    </Screen>
  )
}
