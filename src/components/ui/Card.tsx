import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import styles from './Card.module.css'

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ children, className, ...rest }: Props) {
  return (
    <div className={cn(styles.card, className)} {...rest}>
      {children}
    </div>
  )
}
