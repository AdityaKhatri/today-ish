import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

const SHOW_SCORES_KEY = 'today-ish.showScores'

function readShowScores(): boolean {
  return localStorage.getItem(SHOW_SCORES_KEY) === '1'
}

interface PreferencesValue {
  /** Show the points/score system (headers, per-task score/bleed, previews). */
  showScores: boolean
  setShowScores: (on: boolean) => void
}

const PreferencesContext = createContext<PreferencesValue | null>(null)

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [showScores, setShowScoresState] = useState<boolean>(() => readShowScores())

  // Keep in sync across tabs.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === SHOW_SCORES_KEY) setShowScoresState(readShowScores())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const setShowScores = (on: boolean) => {
    localStorage.setItem(SHOW_SCORES_KEY, on ? '1' : '0')
    setShowScoresState(on)
  }

  return (
    <PreferencesContext.Provider value={{ showScores, setShowScores }}>
      {children}
    </PreferencesContext.Provider>
  )
}

function usePreferences(): PreferencesValue {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences must be used within <PreferencesProvider>')
  return ctx
}

export function useShowScores(): boolean {
  return usePreferences().showScores
}

export function useSetShowScores(): (on: boolean) => void {
  return usePreferences().setShowScores
}
