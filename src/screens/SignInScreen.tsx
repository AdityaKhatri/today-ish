import { useState } from 'react'
import { useAuth } from '@/auth/useAuth'
import styles from './SignInScreen.module.css'

/** Map a Firebase auth error code to a user-facing message (null = user dismissed). */
function messageForAuthError(code: string): string | null {
  switch (code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return null // user closed the popup — not an error worth showing
    case 'auth/popup-blocked':
      return 'Your browser blocked the sign-in popup. Allow popups for this site and try again.'
    case 'auth/unauthorized-domain':
      return "This domain isn't authorized in Firebase Auth. Add it under Authentication → Settings → Authorized domains (use http://localhost, not 127.0.0.1)."
    case 'auth/operation-not-allowed':
    case 'auth/configuration-not-found':
      return "Google sign-in isn't fully set up for this project (enable Google and set a support email in Firebase → Auth → Sign-in method)."
    case 'auth/network-request-failed':
      return 'Could not reach Firebase. Check your connection and try again.'
    default:
      return `Sign-in failed (${code || 'unknown error'}). Try again.`
  }
}

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
      // Surface the real code so failures are diagnosable, and log the full error.
      console.error('[auth] sign-in failed', err)
      const code = (err as { code?: string })?.code ?? ''
      setError(messageForAuthError(code))
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
