import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import styles from './AppFrame.module.css'

/**
 * Responsive app frame. On mobile it's a passthrough (each screen keeps its
 * bottom nav). At ≥900px it becomes a centered card with a persistent sidebar
 * rail on the left and the routed screen filling the content area.
 */
export function AppFrame({ children }: { children: ReactNode }) {
  return (
    <div className={styles.frame}>
      <Sidebar />
      <div className={styles.content}>{children}</div>
    </div>
  )
}
