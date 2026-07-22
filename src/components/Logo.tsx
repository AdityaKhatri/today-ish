const SPIRAL_PATH =
  'M 3.3 2.9 L 2.0 8.6 L 2.1 14.2 L 3.4 19.1 L 5.6 23.4 L 8.5 26.7 L 11.9 29.1 L 15.5 30.6 L 19.0 31.1 L 22.4 30.9 L 25.3 29.9 L 27.8 28.4 L 29.7 26.5 L 31.1 24.4 L 31.8 22.2 L 32.0 20.0 L 31.7 18.0 L 31.0 16.2 L 30.0 14.8 L 28.8 13.7 L 27.4 13.0 L 26.1 12.6 L 24.8 12.6 L 23.5 12.8 L 22.5 13.3 L 21.7 14.0 L 21.1 14.7 L 20.7 15.6 L 20.5 16.4 L 20.5 17.2 L 20.7 17.9 L 21.1 18.6 L 21.5 19.0 L 22.0 19.4 L 22.5 19.6 L 23.0 19.6 L 23.5 19.6 L 24.0 19.5 L 24.3 19.2 L 24.6 18.9 L 24.8 18.6 L 24.9 18.3 L 24.9 18.0 L 24.8 17.7 L 24.6 17.2 L 24.0 16.9 L 23.5 17.1 L 23.2 17.5 L 23.3 17.8 L 23.6 18.0'

let gradientSeq = 0

/** The nautilus mark — golden-ratio spiral with a coral→turquoise gradient stroke. */
export function NautilusMark({ size = 40 }: { size?: number }) {
  // Unique gradient id per instance so multiple marks on a page don't collide.
  const gid = `naut-${(gradientSeq += 1)}`
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="10%" y1="5%" x2="75%" y2="60%">
          <stop offset="0%" stopColor="#FFB6A3" />
          <stop offset="100%" stopColor="#2FB6A8" />
        </linearGradient>
      </defs>
      <path
        d={SPIRAL_PATH}
        stroke={`url(#${gid})`}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

/** The "today-ish" wordmark. */
export function Wordmark({ size = 28 }: { size?: number }) {
  return (
    <span
      style={{
        fontSize: size,
        fontWeight: 800,
        color: 'var(--color-wordmark)',
        letterSpacing: '-0.02em',
        whiteSpace: 'nowrap',
      }}
    >
      today-ish
    </span>
  )
}
