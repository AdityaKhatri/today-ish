import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Screen } from '@/components/layout/Screen'
import { ChoiceChip } from '@/components/ui/ChoiceChip'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { Stepper } from '@/components/ui/Stepper'
import { Toggle } from '@/components/ui/Toggle'
import { useData } from '@/data/DataProvider'
import { cn } from '@/lib/cn'
import { useProfile } from '@/state/ProfileContext'
import type { RoutineWindow } from '@/types/models'
import styles from './RoutineEditorScreen.module.css'

const WINDOW_OPTIONS: ReadonlyArray<{ value: RoutineWindow; label: string }> = [
  { value: 'flexible', label: 'Flexible' },
  { value: 'fixed', label: 'Fixed time' },
  { value: 'anytime', label: 'Anytime' },
  { value: 'multi', label: 'Few times/day' },
]

// Display order Mon…Sun. repeatDays uses 0=Sun…6=Sat, so index i → (i + 1) % 7.
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const dayIndexToNumber = (i: number) => (i + 1) % 7

export function RoutineEditorScreen() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { routines, createRoutine, updateRoutine } = useData()
  const { activeProfile } = useProfile()

  const existing = id ? routines.find((r) => r.id === id) : undefined
  const isEdit = Boolean(id)

  const [title, setTitle] = useState(existing?.title ?? '')
  const [windowType, setWindowType] = useState<RoutineWindow>(existing?.windowType ?? 'multi')
  const [timesPerDay, setTimesPerDay] = useState(existing?.targetCount ?? 3)
  const [fixedTime, setFixedTime] = useState(
    existing?.windowType === 'fixed' ? (existing.windowStart ?? '08:00') : '08:00',
  )
  const [windowStart, setWindowStart] = useState(existing?.windowStart ?? '06:00')
  const [windowEnd, setWindowEnd] = useState(existing?.windowEnd ?? '11:00')
  const [days, setDays] = useState<boolean[]>(() =>
    existing
      ? DAY_LABELS.map((_, i) => existing.repeatDays.includes(dayIndexToNumber(i)))
      : [true, true, true, true, true, false, false],
  )
  const [reminderOn, setReminderOn] = useState(existing?.reminderEnabled ?? true)

  const canSave = title.trim().length > 0

  function toggleDay(i: number) {
    setDays((d) => d.map((v, idx) => (idx === i ? !v : v)))
  }

  function handleSave() {
    const repeatDays = days
      .map((on, i) => (on ? dayIndexToNumber(i) : -1))
      .filter((n) => n >= 0)
      .sort((a, b) => a - b)

    const input = {
      title,
      category: existing?.category ?? activeProfile,
      profile: existing?.profile ?? activeProfile,
      windowType,
      windowStart: windowType === 'fixed' ? fixedTime : windowType === 'flexible' ? windowStart : null,
      windowEnd: windowType === 'flexible' ? windowEnd : null,
      repeatDays,
      reminderEnabled: reminderOn,
      targetCount: windowType === 'multi' ? timesPerDay : null,
    }

    // Instant-optimistic write; local cache reflects it immediately.
    if (isEdit && id) void updateRoutine(id, input)
    else void createRoutine(input)
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

      {windowType === 'multi' && (
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

      {windowType === 'fixed' && (
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

      {windowType === 'flexible' && (
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
