import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Profile, ProfileFilter } from '@/types/models'

interface ProfileContextValue {
  /** Segmented-control selection on Home/Tasks/Routines. */
  filter: ProfileFilter
  setFilter: (f: ProfileFilter) => void
  /** Profile new items default to (the last non-"all" selection). */
  activeProfile: Profile
  setActiveProfile: (p: Profile) => void
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

const FILTER_KEY = 'today-ish.filter'
const ACTIVE_KEY = 'today-ish.activeProfile'

function readStored<T extends string>(key: string, fallback: T, allowed: readonly T[]): T {
  const v = localStorage.getItem(key)
  return v && (allowed as readonly string[]).includes(v) ? (v as T) : fallback
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [filter, setFilterState] = useState<ProfileFilter>(() =>
    readStored<ProfileFilter>(FILTER_KEY, 'all', ['all', 'personal', 'work']),
  )
  const [activeProfile, setActiveProfileState] = useState<Profile>(() =>
    readStored<Profile>(ACTIVE_KEY, 'personal', ['personal', 'work']),
  )

  useEffect(() => {
    localStorage.setItem(FILTER_KEY, filter)
  }, [filter])
  useEffect(() => {
    localStorage.setItem(ACTIVE_KEY, activeProfile)
  }, [activeProfile])

  const setFilter = (f: ProfileFilter) => {
    setFilterState(f)
    // Picking a concrete profile also makes it the default for new items.
    if (f !== 'all') setActiveProfileState(f)
  }

  return (
    <ProfileContext.Provider
      value={{ filter, setFilter, activeProfile, setActiveProfile: setActiveProfileState }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used within <ProfileProvider>')
  return ctx
}
