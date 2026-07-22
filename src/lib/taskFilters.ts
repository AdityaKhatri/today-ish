import type { Profile, ProfileFilter } from '@/types/models'

/** Does an item's profile match the current segmented-control selection? */
export function matchesProfile(itemProfile: Profile, filter: ProfileFilter): boolean {
  return filter === 'all' || itemProfile === filter
}
