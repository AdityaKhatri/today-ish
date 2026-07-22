import { cn } from '@/lib/cn'
import styles from './ScoreHeadline.module.css'

/**
 * The running-score header: total potential (green, largest text) + daily bleed
 * (red). `compact` drops the captions for the Tasks list header.
 */
export function ScoreHeadline({
  potential,
  bleed,
  compact,
}: {
  potential: number
  bleed: number
  compact?: boolean
}) {
  return (
    <div className={cn(styles.wrap, compact && styles.compact)}>
      <div>
        <div className={styles.potential}>+{potential}</div>
        {!compact && <div className={styles.potentialCaption}>if you clear today&rsquo;s queue</div>}
      </div>
      <div className={styles.bleedWrap}>
        <div className={styles.bleed}>−{bleed}/day</div>
        {!compact && <div className={styles.bleedCaption}>if you don&rsquo;t</div>}
      </div>
    </div>
  )
}
