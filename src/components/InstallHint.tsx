import { ShareIcon } from '@/components/icons'
import { Button } from '@/components/ui/Button'
import { isIOS, isStandalone, promptInstall, useCanInstall } from '@/state/installPrompt'
import styles from './InstallHint.module.css'

/**
 * Install affordance for the sign-in screen:
 *  • Android / desktop Chrome → a native "Install app" button (when available).
 *  • iOS Safari → the Add-to-Home-Screen instruction (no programmatic prompt on iOS).
 *  • Already installed → nothing.
 */
export function InstallHint() {
  const canInstall = useCanInstall()

  if (isStandalone()) return null

  if (canInstall) {
    return (
      <Button variant="secondary" className={styles.btn} onClick={() => void promptInstall()}>
        Install app
      </Button>
    )
  }

  if (isIOS()) {
    return (
      <div className={styles.ios}>
        <span className={styles.iosIcon}>
          <ShareIcon size={16} />
        </span>
        To install: tap <strong>Share</strong>, then <strong>Add to Home Screen</strong>.
      </div>
    )
  }

  return null
}
