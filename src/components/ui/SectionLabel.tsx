import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import styles from './SectionLabel.module.css'

export function SectionLabel({
  children,
  small,
  className,
}: {
  children: ReactNode
  small?: boolean
  className?: string
}) {
  return <div className={cn(styles.label, small && styles.small, className)}>{children}</div>
}
