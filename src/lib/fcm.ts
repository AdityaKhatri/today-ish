import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging'
import { serverTimestamp, setDoc } from 'firebase/firestore'
import { app, db } from '@/firebase/config'
import { doc } from 'firebase/firestore'

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY

type Platform = 'web' | 'ios-pwa' | 'android'

function detectPlatform(): Platform {
  const ua = navigator.userAgent
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  if (/iphone|ipad|ipod/i.test(ua)) return standalone ? 'ios-pwa' : 'web'
  if (/android/i.test(ua)) return 'android'
  return 'web'
}

/**
 * Register (or refresh) this device's FCM token and store it at
 * /users/{uid}/pushTokens/{token}. Safe to call on every app open — it upserts
 * and bumps lastSeenAt. No-ops if FCM is unsupported, permission isn't granted,
 * or the VAPID key is missing.
 */
export async function registerFcmToken(uid: string): Promise<string | null> {
  try {
    if (!(await isSupported())) return null
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return null
    if (!VAPID_KEY) {
      console.warn('[fcm] VITE_FIREBASE_VAPID_KEY is not set — cannot register for push')
      return null
    }
    const messaging = getMessaging(app)
    const token = await getToken(messaging, { vapidKey: VAPID_KEY })
    if (!token) return null
    await setDoc(
      doc(db, 'users', uid, 'pushTokens', token),
      {
        token,
        platform: detectPlatform(),
        createdAt: serverTimestamp(),
        lastSeenAt: serverTimestamp(),
      },
      { merge: true },
    )
    return token
  } catch (err) {
    console.error('[fcm] registerFcmToken failed', err)
    return null
  }
}

let foregroundReady = false

/** Show FCM messages that arrive while the app is in the foreground. */
export async function setupForegroundMessages(): Promise<void> {
  try {
    if (foregroundReady || !(await isSupported())) return
    foregroundReady = true
    const messaging = getMessaging(app)
    onMessage(messaging, (payload) => {
      const data = payload.data ?? {}
      const title = data.title || payload.notification?.title || 'Today-ish'
      const body = data.body || payload.notification?.body || ''
      navigator.serviceWorker.ready
        .then((reg) =>
          reg.showNotification(title, {
            body,
            tag: data.tag,
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
          }),
        )
        .catch(() => {})
    })
  } catch {
    /* ignore */
  }
}
