import { useNavigate } from 'react-router-dom'
import { CloseIcon, SendIcon } from '@/components/icons'
import styles from './AskAiSheet.module.css'

/**
 * Ask-AI sheet.
 *
 * DEFERRED build: the layout is design-complete but READ-ONLY and inert — the
 * assistant needs a server-side home for an API key (Blaze). The sample
 * exchange below is static. The disabled entry point is the FAB (see
 * AskAiFab.tsx); this route exists so the screen is reviewable.
 *
 * FUTURE (Blaze): stream real answers from the assistant backend; the assistant
 * reads tasks but never edits them.
 */
export function AskAiSheet() {
  const navigate = useNavigate()

  return (
    <div className={styles.sheet}>
      <div className={styles.head}>
        <div className={styles.headRow}>
          <div className={styles.headTitle}>Ask Today-ish</div>
          <button className={styles.close} aria-label="Close" onClick={() => navigate(-1)}>
            <CloseIcon size={18} />
          </button>
        </div>
        <div className={styles.headSub}>Reads your tasks. Never edits them.</div>
      </div>

      <div className={styles.body}>
        <div className={styles.user}>If I have 20 minutes right now, what&rsquo;s smartest?</div>
        <div className={styles.ai}>
          Review Sarah&rsquo;s PR — 15 minutes, due today, and it&rsquo;s blocking someone else.
          Inbox zero can wait, it isn&rsquo;t bleeding yet.
        </div>
      </div>

      <div className={styles.inputBar}>
        <input
          className={styles.input}
          placeholder="Ask about your day… (coming soon)"
          disabled
          aria-disabled="true"
        />
        <button className={styles.send} aria-label="Send" disabled aria-disabled="true">
          <SendIcon size={16} />
        </button>
      </div>
    </div>
  )
}
