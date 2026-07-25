import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

// Captured at module load so we don't miss the (early) beforeinstallprompt event.
let deferredPrompt: BeforeInstallPromptEvent | null = null
const subscribers = new Set<() => void>()

function emit() {
  for (const cb of subscribers) cb()
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault() // stash it; we trigger the prompt from our own button
    deferredPrompt = e as BeforeInstallPromptEvent
    emit()
  })
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    emit()
  })
}

/** Already running as an installed PWA? */
export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

export function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

/** Trigger the native install prompt (Android / desktop Chrome). */
export async function promptInstall(): Promise<void> {
  if (!deferredPrompt) return
  await deferredPrompt.prompt()
  try {
    await deferredPrompt.userChoice
  } catch {
    /* ignore */
  }
  deferredPrompt = null
  emit()
}

/** True when the native install prompt is available. */
export function useCanInstall(): boolean {
  const [can, setCan] = useState(deferredPrompt !== null)
  useEffect(() => {
    const cb = () => setCan(deferredPrompt !== null)
    subscribers.add(cb)
    return () => {
      subscribers.delete(cb)
    }
  }, [])
  return can
}
