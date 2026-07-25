import { useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { ChoiceChip } from '@/components/ui/ChoiceChip'
import { SectionLabel } from '@/components/ui/SectionLabel'
import {
  EFFORT_OPTIONS,
  baseScoreForEffortMinutes,
  peakScore,
  suggestedDecayRatePerDay,
  urgencyMultiplierForDeadline,
} from '@/lib/scoring'
import { DEADLINE_OPTIONS, DEADLINE_PHRASE, deadlineToDate } from '@/lib/taskForm'
import type { DeadlineChoice } from '@/lib/taskForm'
import { useShowScores } from '@/state/PreferencesContext'
import type { Profile } from '@/types/models'
import styles from './TaskChips.module.css'

export interface TaskChipsValue {
  profile: Profile
  deadline: DeadlineChoice
  pickedISO: string
  effortMinutes: number
}

/** Profile / Deadline / Effort choice chips + a live score preview. Controlled. */
export function TaskChips({
  value,
  onChange,
}: {
  value: TaskChipsValue
  onChange: (patch: Partial<TaskChipsValue>) => void
}) {
  const showScores = useShowScores()

  const preview = useMemo(() => {
    const now = Date.now()
    const deadlineMs = deadlineToDate(value.deadline, value.pickedISO).getTime()
    const base = baseScoreForEffortMinutes(value.effortMinutes)
    const urgency = urgencyMultiplierForDeadline(now, deadlineMs)
    return {
      peak: peakScore(base, urgency),
      decay: suggestedDecayRatePerDay(base, urgency),
      urgency,
    }
  }, [value.deadline, value.pickedISO, value.effortMinutes])

  return (
    <>
      <SectionLabel className={styles.label}>Profile</SectionLabel>
      <div className={styles.row2}>
        <ChoiceChip
          selected={value.profile === 'personal'}
          onClick={() => onChange({ profile: 'personal' })}
        >
          Personal
        </ChoiceChip>
        <ChoiceChip selected={value.profile === 'work'} onClick={() => onChange({ profile: 'work' })}>
          Work
        </ChoiceChip>
      </div>

      <SectionLabel className={styles.label}>Deadline</SectionLabel>
      <div className={styles.grid2}>
        {DEADLINE_OPTIONS.map((opt) => (
          <ChoiceChip
            key={opt.value}
            selected={value.deadline === opt.value}
            onClick={() => onChange({ deadline: opt.value })}
          >
            {opt.label}
          </ChoiceChip>
        ))}
      </div>
      {value.deadline === 'pick' && (
        <input
          type="date"
          className={styles.dateInput}
          value={value.pickedISO}
          onChange={(e) => onChange({ pickedISO: e.target.value })}
        />
      )}

      <SectionLabel className={styles.label}>Effort</SectionLabel>
      <div className={styles.effortRow}>
        {EFFORT_OPTIONS.map((o) => (
          <ChoiceChip
            key={o.minutes}
            selected={value.effortMinutes === o.minutes}
            onClick={() => onChange({ effortMinutes: o.minutes })}
            className={styles.effortChip}
          >
            {o.label}
          </ChoiceChip>
        ))}
      </div>

      {showScores && (
        <Card className={styles.preview}>
          <SectionLabel small>If done today</SectionLabel>
          <div className={styles.previewRow}>
            <div className={styles.previewPeak}>+{preview.peak}</div>
            <div className={styles.previewBleed}>−{preview.decay}/day after</div>
          </div>
          <div className={styles.previewSub}>
            {EFFORT_OPTIONS.find((o) => o.minutes === value.effortMinutes)?.label} effort · urgency ×
            {preview.urgency.toFixed(1)} for a {DEADLINE_PHRASE[value.deadline]} deadline
          </div>
        </Card>
      )}
    </>
  )
}
