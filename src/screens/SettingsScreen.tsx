import { useNavigate } from 'react-router-dom'
import { BottomNav } from '@/components/layout/BottomNav'
import { Screen } from '@/components/layout/Screen'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { Toggle } from '@/components/ui/Toggle'
import { cn } from '@/lib/cn'
import { BUILD, buildDateLabel } from '@/lib/buildInfo'
import { showReminder } from '@/lib/reminders'
import type { ReminderFrequency } from '@/lib/reminders'
import { useAuth } from '@/auth/useAuth'
import { useShowScores, useSetShowScores } from '@/state/PreferencesContext'
import { useReminders } from '@/state/useReminders'
import styles from './SettingsScreen.module.css'

const FREQ_OPTIONS: ReadonlyArray<{ value: ReminderFrequency; label: string }> = [
  { value: 'low', label: 'Once' },
  { value: 'medium', label: 'A few' },
  { value: 'high', label: 'Often' },
]

const FREQ_HINT: Record<ReminderFrequency, string> = {
  low: 'One summary each morning.',
  medium: 'Morning, midday, and evening summaries.',
  high: 'Summaries plus per-task due & overdue alerts.',
}

export function SettingsScreen() {
  const navigate = useNavigate()
  const { signOutNow } = useAuth()
  const { permission, enabled, frequency, enable, disable, setFrequency } = useReminders()
  const showScores = useShowScores()
  const setShowScores = useSetShowScores()

  const reminderSub =
    permission === 'unsupported'
      ? 'Not supported on this device'
      : permission === 'denied'
        ? 'Blocked — enable in device settings'
        : enabled
          ? 'On'
          : 'Off'

  return (
    <Screen footer={<BottomNav />} contentClassName={styles.content}>
      <div className={styles.title}>Settings</div>

      <SectionLabel small className={styles.sectionLabel}>
        Profiles
      </SectionLabel>
      <div className={styles.listCard}>
        <div className={cn(styles.row, styles.rowBordered)}>
          <div className={styles.rowText}>Personal — Errands, Health, Home</div>
        </div>
        <div className={styles.row}>
          <div className={styles.rowText}>Work — Engineering, Meetings, Admin</div>
        </div>
      </div>

      <SectionLabel small className={styles.sectionLabel}>
        Quiet hours
      </SectionLabel>
      <div className={styles.listCard}>
        <div className={cn(styles.row, styles.rowBordered)}>
          <div className={styles.rowText}>Work</div>
          <div className={styles.rowValue}>9:00am – 6:00pm</div>
        </div>
        <div className={styles.row}>
          <div className={styles.rowText}>Personal</div>
          <div className={styles.rowValue}>Off</div>
        </div>
      </div>

      <SectionLabel small className={styles.sectionLabel}>
        Display
      </SectionLabel>
      <div className={styles.actionCard}>
        <div>
          <div className={styles.actionTitle}>Show points</div>
          <div className={styles.actionSub}>Task scores and daily bleed rates</div>
        </div>
        <Toggle checked={showScores} onChange={setShowScores} label="Show points" />
      </div>

      <SectionLabel small className={styles.sectionLabel}>
        Notifications
      </SectionLabel>
      <div className={styles.actionCard}>
        <div>
          <div className={styles.actionTitle}>Reminders</div>
          <div className={styles.actionSub}>{reminderSub}</div>
        </div>
        {permission !== 'unsupported' &&
          permission !== 'denied' &&
          (enabled ? (
            <button className={styles.turnOff} onClick={disable}>
              Turn off
            </button>
          ) : (
            <button
              className={styles.turnOn}
              onClick={() => (permission === 'granted' ? void enable() : navigate('/reminders'))}
            >
              Turn on
            </button>
          ))}
      </div>

      {enabled && (
        <div className={styles.freqBlock}>
          <SectionLabel small className={styles.sectionLabel}>
            How often
          </SectionLabel>
          <SegmentedControl options={FREQ_OPTIONS} value={frequency} onChange={setFrequency} />
          <div className={styles.freqHint}>{FREQ_HINT[frequency]}</div>
        </div>
      )}

      {enabled && (
        <button
          className={styles.testBtn}
          onClick={() =>
            void showReminder('Today-ish', 'Test notification — reminders are working.', 'test')
          }
        >
          Send a test notification
        </button>
      )}

      <SectionLabel small className={styles.sectionLabel}>
        Install
      </SectionLabel>
      <div className={styles.actionCard}>
        <div>
          <div className={styles.actionTitle}>Home Screen install</div>
          <div className={styles.actionSub}>Required on iPhone for reminders</div>
        </div>
        <button className={styles.showMe} onClick={() => navigate('/install')}>
          Show me how
        </button>
      </div>

      <SectionLabel small className={styles.sectionLabel}>
        About
      </SectionLabel>
      <div className={styles.listCard}>
        <div className={cn(styles.row, styles.rowBordered)}>
          <div className={styles.rowText}>Last updated</div>
          <div className={styles.rowValue}>{buildDateLabel()}</div>
        </div>
        <div className={cn(styles.row, styles.rowBordered)}>
          <div className={styles.rowText}>Build</div>
          <div className={styles.rowValue}>{BUILD.commit}</div>
        </div>
        <div className={styles.messageRow}>{BUILD.message}</div>
      </div>

      <button className={styles.signOut} onClick={signOutNow}>
        Sign out
      </button>
    </Screen>
  )
}
