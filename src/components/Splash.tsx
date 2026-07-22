import { NautilusMark } from '@/components/Logo'

/** Shown while auth resolves and the allowlist check runs (before any app screen). */
export function Splash() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <NautilusMark size={64} />
    </div>
  )
}
