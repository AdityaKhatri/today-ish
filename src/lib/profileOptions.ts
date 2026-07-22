import type { SegmentOption } from '@/components/ui/SegmentedControl'
import type { ProfileFilter } from '@/types/models'

/** Profile switcher options for Home / Tasks / Routines. */
export const PROFILE_OPTIONS: ReadonlyArray<SegmentOption<ProfileFilter>> = [
  { value: 'personal', label: 'Personal' },
  { value: 'work', label: 'Work' },
  { value: 'all', label: 'All' },
]
