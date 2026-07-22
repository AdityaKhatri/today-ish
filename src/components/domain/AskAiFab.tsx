import { SparkleIcon } from '@/components/icons'
import styles from './AskAiFab.module.css'

/**
 * Ask-AI floating button.
 *
 * DEFERRED: AI features have no server-side home yet (Spark plan). Per scope the
 * FAB is present but visibly DISABLED and does nothing.
 *
 * FUTURE (Blaze): drop `disabled`, and `onClick={openAskAiSheet}` to launch the
 * read-only assistant sheet (already built at `src/screens/AskAiSheet.tsx`).
 */
export function AskAiFab() {
  return (
    <button
      type="button"
      className={`${styles.fab} ${styles.disabled}`}
      aria-disabled="true"
      aria-label="Ask Today-ish (coming soon)"
      title="Ask Today-ish — coming soon"
      onClick={(e) => e.preventDefault()}
    >
      <SparkleIcon size={26} />
    </button>
  )
}
