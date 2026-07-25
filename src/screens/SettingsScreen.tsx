import { useNavigate } from 'react-router-dom'
import { BottomNav } from '@/components/layout/BottomNav'
import { Screen } from '@/components/layout/Screen'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { cn } from '@/lib/cn'
import { useAuth } from '@/auth/useAuth'
import { useReminders } from '@/state/useReminders'
import styles from './SettingsScreen.module.css'

export function SettingsScreen() {
  const navigate = useNavigate()
  const { signOutNow } = useAuth()
  const { permission, enabled, enable, disable } = useReminders()

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

      <button className={styles.signOut} onClick={signOutNow}>
        Sign out
      </button>
    </Screen>
  )
}
