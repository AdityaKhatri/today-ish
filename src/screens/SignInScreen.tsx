import { useState } from 'react'
import { useAuth } from '@/auth/useAuth'
import styles from './SignInScreen.module.css'

export function SignInScreen() {
  const { signIn } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignIn() {
    setBusy(true)
    setError(null)
    try {
      await signIn()
      // On success, AuthProvider runs the allowlist check and the router
      // swaps this screen out — nothing more to do here.
    } catch (err) {
      // Popup closed / blocked / network — let the user retry.
      const code = (err as { code?: string })?.code ?? ''
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        setError('Sign-in failed. Check your connection and try again.')
      }
      setBusy(false)
    }
  }

  return (
    <div className={styles.screen}>
      <div className={styles.wordmark}>today-ish</div>
      <div className={styles.tagline}>roughly today, reliably done.</div>

      <button className={styles.googleBtn} onClick={handleSignIn} disabled={busy}>
        <span className={styles.gmark} />
        {busy ? 'Signing in…' : 'Continue with Google'}
      </button>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.note}>
        Today-ish is invite-only. If you weren&rsquo;t invited, sign-in won&rsquo;t unlock the app.
      </div>
    </div>
  )
}
