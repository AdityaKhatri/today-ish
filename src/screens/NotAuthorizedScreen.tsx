import { CloseIcon } from '@/components/icons'
import { useAuth } from '@/auth/useAuth'
import styles from './NotAuthorizedScreen.module.css'

export function NotAuthorizedScreen() {
  const { deniedEmail, signOutNow } = useAuth()
  const email = deniedEmail ?? 'This account'

  return (
    <div className={styles.screen}>
      <div className={styles.iconRing}>
        <CloseIcon size={26} />
      </div>
      <div className={styles.title}>This email isn&rsquo;t on the invite list yet.</div>
      <div className={styles.body}>
        {email} signed in fine — it just isn&rsquo;t on Today-ish&rsquo;s allowlist.
      </div>
      <div className={styles.hint}>If you think this is a mistake, ping whoever invited you.</div>
      <button className={styles.signOut} onClick={signOutNow}>
        Sign out
      </button>
    </div>
  )
}
