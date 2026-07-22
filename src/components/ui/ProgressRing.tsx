/** Circular progress ring for routine completion (done / total). */
export function ProgressRing({
  value,
  max,
  size = 44,
}: {
  value: number
  max: number
  size?: number
}) {
  const r = 18
  const circ = 2 * Math.PI * r
  const frac = max > 0 ? Math.min(1, value / max) : 0
  const dash = frac * circ
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" aria-hidden="true">
      <circle cx="22" cy="22" r={r} fill="none" stroke="var(--color-bg-end)" strokeWidth="5" />
      <circle
        cx="22"
        cy="22"
        r={r}
        fill="none"
        stroke="var(--color-green)"
        strokeWidth="5"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform="rotate(-90 22 22)"
      />
    </svg>
  )
}
