import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import styles from './Screen.module.css'

/**
 * Mobile-first screen shell: caps width on desktop, fills the viewport height,
 * scrolls its content, and pins an optional footer (bottom nav or action bar).
 */
export function Screen({
  children,
  footer,
  overlay,
  contentClassName,
}: {
  children: ReactNode
  footer?: ReactNode
  /** Absolutely-positioned layer above content but aligned to the app container (e.g. a FAB). */
  overlay?: ReactNode
  contentClassName?: string
}) {
  return (
    <div className={styles.shell}>
      <div className={cn(styles.scroll, contentClassName)}>{children}</div>
      {overlay}
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </div>
  )
}
