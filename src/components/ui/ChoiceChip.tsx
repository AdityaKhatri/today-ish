import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import styles from './ChoiceChip.module.css'

export function ChoiceChip({
  selected,
  onClick,
  children,
  className,
}: {
  selected?: boolean
  onClick?: () => void
  children: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(styles.chip, selected && styles.selected, className)}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
