import { RefreshIcon } from '@/components/icons'
import { Card } from '@/components/ui/Card'
import { SectionLabel } from '@/components/ui/SectionLabel'
import styles from './MorningBriefCard.module.css'

/**
 * Morning-brief slot.
 *
 * AI features are DEFERRED for this build (no server-side home for an API key
 * on the Spark plan). The layout slot is preserved with a calm static
 * placeholder so the design isn't half-implemented.
 *
 * FUTURE (Blaze): read the generated brief from
 * `/users/{uid}/dailyBrief/{date}_{profile}` and render it here; wire the
 * refresh control to request a regenerate.
 */
export function MorningBriefCard() {
  return (
    <Card className={styles.card}>
      <div className={styles.head}>
        <SectionLabel small>Morning brief</SectionLabel>
        <span className={styles.refresh} aria-hidden="true">
          <RefreshIcon size={14} />
        </span>
      </div>
      <div className={styles.placeholder}>
        Your morning brief will appear here once AI summaries are switched on.
      </div>
    </Card>
  )
}
