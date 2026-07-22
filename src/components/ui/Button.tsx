import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import styles from './Button.module.css'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  fullWidth?: boolean
  children: ReactNode
}

export function Button({ variant = 'primary', fullWidth, className, children, ...rest }: Props) {
  return (
    <button
      className={cn(styles.btn, styles[variant], fullWidth && styles.full, className)}
      {...rest}
    >
      {children}
    </button>
  )
}
