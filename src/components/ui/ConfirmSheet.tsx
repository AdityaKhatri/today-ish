import { Button } from './Button'
import styles from './ConfirmSheet.module.css'

/**
 * In-app confirmation sheet. Used instead of window.confirm(), which iOS Safari
 * can silently suppress inside an installed (standalone) PWA.
 */
export function ConfirmSheet({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" onClick={onCancel}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.title}>{title}</div>
        {message ? <div className={styles.message}>{message}</div> : null}
        <div className={styles.actions}>
          <Button
            fullWidth
            onClick={onConfirm}
            style={destructive ? { background: 'var(--color-red)', color: '#fff' } : undefined}
          >
            {confirmLabel}
          </Button>
          <Button variant="secondary" fullWidth onClick={onCancel}>
            {cancelLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
