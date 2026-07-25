import { useNavigate } from 'react-router-dom'
import { BellIcon } from '@/components/icons'
import { Button } from '@/components/ui/Button'
import { requestReminders } from '@/lib/reminders'
import styles from './NotificationPrePromptScreen.module.css'

/**
 * App-owned notification pre-prompt, always shown before the raw browser
 * permission dialog. "Turn on" requests the Web Notification permission and
 * records the opt-in; in-app reminders then fire while the app is open. (FCM /
 * background push when fully closed is the future Blaze build.)
 */
export function NotificationPrePromptScreen() {
  const navigate = useNavigate()

  async function handleTurnOn() {
    await requestReminders()
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
