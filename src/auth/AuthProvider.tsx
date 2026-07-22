import { createContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '@/firebase/config'
import { isAllowlisted } from './allowlist'

export type AuthStatus = 'loading' | 'signedOut' | 'checking' | 'allowed' | 'denied'

export interface AuthContextValue {
  status: AuthStatus
  user: User | null
  /** Set when a signed-in-but-unlisted user was bounced; drives Not-authorized. */
  deniedEmail: string | null
  signIn: () => Promise<void>
  signOutNow: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

/** Create `/users/{uid}` on first successful (allowlisted) sign-in. */
async function ensureUserDoc(user: User): Promise<void> {
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    // Matches /users/{uid} in DATA_MODEL.md.
    await setDoc(ref, {
      email: user.email ?? '',
      displayName: user.displayName ?? '',
      photoURL: user.photoURL ?? '',
      createdAt: serverTimestamp(),
      defaultProfile: 'personal',
    })
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<User | null>(null)
  const [deniedEmail, setDeniedEmail] = useState<string | null>(null)

  // When we force-sign-out an unlisted user, onAuthStateChanged fires again
  // with null. This ref keeps that from flipping us to the sign-in screen so
  // the Not-authorized screen stays put.
  const denyingRef = useRef(false)

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (!u) {
        if (denyingRef.current) {
          denyingRef.current = false
          setStatus('denied')
        } else {
          setUser(null)
          setStatus('signedOut')
        }
        return
      }

      // Signed in — verify allowlist BEFORE exposing any app screen.
      setUser(u)
      setStatus('checking')
      try {
        const allowed = u.email ? await isAllowlisted(u.email) : false
        if (allowed) {
          await ensureUserDoc(u)
          setStatus('allowed')
        } else {
          setDeniedEmail(u.email ?? 'this account')
          denyingRef.current = true
          setUser(null)
          await signOut(auth)
        }
      } catch (err) {
        console.error('[auth] allowlist check failed', err)
        setDeniedEmail(u.email ?? 'this account')
        denyingRef.current = true
        setUser(null)
        await signOut(auth)
      }
    })
  }, [])

  const signIn = async () => {
    setDeniedEmail(null)
    // Popup is simplest cross-platform; a future redirect flow can swap in here.
    await signInWithPopup(auth, googleProvider)
  }

  const signOutNow = async () => {
    setDeniedEmail(null)
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ status, user, deniedEmail, signIn, signOutNow }}>
      {children}
    </AuthContext.Provider>
  )
}
