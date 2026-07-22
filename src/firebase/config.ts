import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  // Fail loudly in dev if .env.local hasn't been filled in.
  console.error(
    '[today-ish] Missing Firebase env vars. Copy .env.example to .env.local and fill it in.',
  )
}

export const app = initializeApp(firebaseConfig)

/**
 * Firestore with offline persistence (IndexedDB, multi-tab safe).
 *
 * Offline-first is load-bearing for this app: completions written while offline
 * sync when the network returns, and because every completion timestamp is
 * captured client-side (`Timestamp.now()` at the moment of the tap), the
 * correct score is credited on sync — not the time the write happened to land.
 */
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
})

export const auth = getAuth(app)

export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })
