import { useNavigate } from 'react-router-dom'
import { AddSquareIcon, CheckIcon, ShareIcon } from '@/components/icons'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import styles from './IosInstallNudgeScreen.module.css'

/**
 * iOS install nudge — shown on iPhone Safari (see `shouldShowIosInstallNudge`).
 * Installing to the Home Screen is what makes reminders possible on iOS once
 * push lands, and gives the standalone PWA experience today.
 */
export function IosInstallNudgeScreen() {
  const navigate = useNavigate()
  return (
    <div className={styles.screen}>
      <div className={styles.body}>
        <div className={styles.title}>Add Today-ish to your Home Screen</div>
        <div className={styles.sub}>
          Reminders on iPhone only work once the app is installed — it takes ten seconds.
        </div>
        <div className={styles.steps}>
          <div className={styles.step}>
            <span className={styles.stepIcon}>
              <ShareIcon size={14} />
            </span>
            <span className={styles.stepText}>1. Tap the Share icon in Safari</span>
          </div>
          <div className={styles.step}>
            <span className={styles.stepIcon}>
              <AddSquareIcon size={14} />
            </span>
            <span className={styles.stepText}>2. Scroll down, tap &ldquo;Add to Home Screen&rdquo;</span>
          </div>
          <div className={styles.step}>
            <span className={cn(styles.stepIcon, styles.stepIconDone)}>
              <CheckIcon size={14} />
            </span>
            <span className={styles.stepText}>3. Open Today-ish from your Home Screen</span>
          </div>
        </div>
      </div>
      <Button fullWidth onClick={() => navigate(-1)}>
        Got it
      </Button>
    </div>
  )
}
