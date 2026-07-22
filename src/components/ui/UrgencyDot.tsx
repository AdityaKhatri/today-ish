import type { UrgencyTier } from '@/lib/scoring'

const TIER_COLOR: Record<UrgencyTier, string> = {
  red: 'var(--color-red)',
  amber: 'var(--color-amber)',
  green: 'var(--color-green)',
}

/** Small colored dot before a task title signalling urgency (per Nautilus spec). */
export function UrgencyDot({ tier, size = 8 }: { tier: UrgencyTier; size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        flex: 'none',
        borderRadius: '50%',
        background: TIER_COLOR[tier],
        display: 'inline-block',
      }}
    />
  )
}
