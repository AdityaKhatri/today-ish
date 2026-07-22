import { useNavigate } from 'react-router-dom'
import { BellIcon } from '@/components/icons'
import { Button } from '@/components/ui/Button'
import styles from './NotificationPrePromptScreen.module.css'

/**
 * App-owned notification pre-prompt. It is ALWAYS shown before the raw browser
 * permission dialog would be.
 *
 * DEFERRED build: reminders are in-app only (no FCM / background push on the
 * Spark plan), so both buttons are inert and just dismiss. The screen + flow are
 * built so nothing changes structurally when push lands.
 */
export function NotificationPrePromptScreen() {
  const navigate = useNavigate()

  function handleTurnOn() {
    // FUTURE (Blaze + FCM): request Notification permission here, then register
    // the FCM token. For now this is a no-op that dismisses the screen.
    navigate(-1)
  }

  return (
    <div className={styles.screen}>
      <div className={styles.iconTile}>
        <BellIcon size={30} />
      </div>
      <div className={styles.title}>Stay on top of it, quietly.</div>
      <div className={styles.body}>
        We&rsquo;ll remind you at the times you set — quietly if you&rsquo;re doing well, a little
        louder if things are slipping.
      </div>
      <Button className={styles.primary} onClick={handleTurnOn}>
        Turn on reminders
      </Button>
      <button className={styles.notNow} onClick={() => navigate(-1)}>
        Not now
      </button>
    </div>
  )
}
