import { cn } from '@/lib/cn'
import styles from './Toggle.module.css'

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={cn(styles.track, checked && styles.on)}
      onClick={() => onChange(!checked)}
    >
      <span className={cn(styles.knob, checked && styles.knobOn)} />
    </button>
  )
}
