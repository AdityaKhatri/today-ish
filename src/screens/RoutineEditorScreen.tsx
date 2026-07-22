import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Screen } from '@/components/layout/Screen'
import { ChoiceChip } from '@/components/ui/ChoiceChip'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { Stepper } from '@/components/ui/Stepper'
import { Toggle } from '@/components/ui/Toggle'
import { cn } from '@/lib/cn'
import type { RoutineWindow } from '@/types/models'
import styles from './RoutineEditorScreen.module.css'

const WINDOW_OPTIONS: ReadonlyArray<{ value: RoutineWindow; label: string }> = [
  { value: 'flexible-window', label: 'Flexible' },
  { value: 'fixed-time', label: 'Fixed time' },
  { value: 'anytime-today', label: 'Anytime' },
  { value: 'few-times-per-day', label: 'Few times/day' },
]

// Display order Mon…Sun; index maps to daysOfWeek later (0=Sun via % 7).
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export function RoutineEditorScreen() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [title, setTitle] = useState('')
  const [windowType, setWindowType] = useState<RoutineWindow>('few-times-per-day')
  const [timesPerDay, setTimesPerDay] = useState(3)
  const [fixedTime, setFixedTime] = useState('08:00')
  const [windowStart, setWindowStart] = useState('06:00')
  const [windowEnd, setWindowEnd] = useState('11:00')
  const [days, setDays] = useState<boolean[]>([true, true, true, true, true, false, false])
  const [reminderOn, setReminderOn] = useState(true)

  const canSave = title.trim().length > 0

  function toggleDay(i: number) {
    setDays((d) => d.map((v, idx) => (idx === i ? !v : v)))
  }

  function handleSave() {
    // TODO(data layer): create/update /users/{uid}/routines with these fields;
    // streaks are maintained transactionally on the routine doc.
    console.info('[today-ish] saveRoutine (not yet persisted)', {
      id,
      title,
      windowType,
      timesPerDay,
      fixedTime,
      windowStart,
      windowEnd,
      days,
      reminderOn,
    })
    navigate('/routines')
  }

  return (
    <Screen
      contentClassName={styles.content}
      footer={
        <div className={styles.footerPad}>
          <div className={styles.reminder}>
            <div className={styles.reminderLabel}>Remind me</div>
            <Toggle checked={reminderOn} onChange={setReminderOn} label="Remind me" />
          </div>
        </div>
      }
    >
      <div className={styles.header}>
        <button className={styles.cancel} onClick={() => navigate(-1)}>
          Cancel
        </button>
        <div className={styles.headTitle}>{isEdit ? 'Edit routine' : 'New routine'}</div>
        <button className={styles.save} disabled={!canSave} onClick={handleSave}>
          Save
        </button>
      </div>

      <input
        className={styles.titleInput}
        placeholder="Drink water"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <SectionLabel className={styles.label}>Window type</SectionLabel>
      <div className={styles.windowGrid}>
        {WINDOW_OPTIONS.map((opt) => (
          <ChoiceChip
            key={opt.value}
            selected={windowType === opt.value}
            onClick={() => setWindowType(opt.value)}
            className={styles.windowChip}
          >
            {opt.label}
          </ChoiceChip>
        ))}
      </div>

      {windowType === 'few-times-per-day' && (
        <>
          <SectionLabel className={styles.label}>How many times</SectionLabel>
          <div className={styles.section}>
            <Stepper
              value={timesPerDay}
              onChange={setTimesPerDay}
              min={2}
              max={12}
              renderValue={(n) => `${n} times / day`}
            />
          </div>
        </>
      )}

      {windowType === 'fixed-time' && (
        <>
          <SectionLabel className={styles.label}>At</SectionLabel>
          <div className={styles.timeRow}>
            <input
              type="time"
              className={styles.timeInput}
              value={fixedTime}
              onChange={(e) => setFixedTime(e.target.value)}
            />
          </div>
        </>
      )}

      {windowType === 'flexible-window' && (
        <>
          <SectionLabel className={styles.label}>Window</SectionLabel>
          <div className={styles.timeRow}>
            <input
              type="time"
              className={styles.timeInput}
              value={windowStart}
              onChange={(e) => setWindowStart(e.target.value)}
            />
            <input
              type="time"
              className={styles.timeInput}
              value={windowEnd}
              onChange={(e) => setWindowEnd(e.target.value)}
            />
          </div>
        </>
      )}

      <SectionLabel className={styles.label}>Repeats on</SectionLabel>
      <div className={styles.days}>
        {DAY_LABELS.map((label, i) => (
          <button
            key={i}
            type="button"
            aria-pressed={days[i]}
            className={cn(styles.day, days[i] && styles.dayActive)}
            onClick={() => toggleDay(i)}
          >
            {label}
          </button>
        ))}
      </div>
    </Screen>
  )
}
