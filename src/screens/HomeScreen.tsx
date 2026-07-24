import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon } from '@/components/icons'
import { Wordmark } from '@/components/Logo'
import { ScoreHeadline } from '@/components/domain/ScoreHeadline'
import { TaskCard } from '@/components/domain/TaskCard'
import { BottomNav } from '@/components/layout/BottomNav'
import { Screen } from '@/components/layout/Screen'
import { OfflineBadge } from '@/components/ui/OfflineBadge'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { useAuth } from '@/auth/useAuth'
import { useData } from '@/data/DataProvider'
import { SHOW_SCORES } from '@/lib/features'
import { formatLongDate } from '@/lib/dates'
import { PROFILE_OPTIONS } from '@/lib/profileOptions'
import type { UrgencyTier } from '@/lib/scoring'
import { matchesProfile } from '@/lib/taskFilters'
import { buildTaskView, isRoutineDone, routineActiveOn, sumBleed, sumLive } from '@/lib/views'
import { useProfile } from '@/state/ProfileContext'
import { useNow } from '@/state/useNow'
import styles from './HomeScreen.module.css'

const TIER_RANK: Record<UrgencyTier, number> = { red: 0, amber: 1, green: 2 }

export function HomeScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { filter, setFilter } = useProfile()
  const { tasks, routines, todayLogs } = useData()
  const now = useNow() // re-render each minute so scores/urgency stay live

  const firstName = user?.displayName?.split(' ')[0] ?? 'there'

  const views = useMemo(
    () =>
      tasks
        .filter((t) => t.status === 'active' && matchesProfile(t.profile, filter))
        .map((t) => buildTaskView(t, now))
        .sort((a, b) => TIER_RANK[a.tier] - TIER_RANK[b.tier] || b.bleed - a.bleed),
    [tasks, filter, now],
  )
  const topPriorities = views.slice(0, 4)

  const { doneCount, total, maxStreak } = useMemo(() => {
    const dow = new Date(now).getDay()
    const active = routines.filter((r) => matchesProfile(r.profile, filter) && routineActiveOn(r, dow))
    return {
      doneCount: active.filter((r) => isRoutineDone(r, todayLogs[r.id])).length,
      total: active.length,
      maxStreak: active.reduce((m, r) => Math.max(m, r.currentStreak), 0),
    }
  }, [routines, todayLogs, filter, now])

  return (
    <Screen footer={<BottomNav />} contentClassName={styles.content}>
      <div className={styles.topbar}>
        <Wordmark size={16} />
        <OfflineBadge />
      </div>

      <div className={styles.greetingRow}>
        <div>
          <div className={styles.greeting}>Hi, {firstName}</div>
          <div className={styles.date}>{formatLongDate(new Date(now))}</div>
        </div>
        <button className={styles.addBtn} aria-label="Add task" onClick={() => navigate('/add')}>
          <PlusIcon size={24} />
        </button>
      </div>

      {SHOW_SCORES && (
        <div className={styles.score}>
          <ScoreHeadline potential={sumLive(views)} bleed={sumBleed(views)} />
        </div>
      )}

      <div className={styles.switcher}>
        <SegmentedControl options={PROFILE_OPTIONS} value={filter} onChange={setFilter} />
      </div>

      <SectionLabel className={styles.priorityLabel}>Top priorities</SectionLabel>
      {topPriorities.length > 0 ? (
        topPriorities.map((t) => (
          <TaskCard key={t.id} task={t} onClick={() => navigate(`/tasks/${t.id}`)} />
        ))
      ) : (
        <div className={styles.empty}>Nothing pressing. Enjoy the breathing room.</div>
      )}

      <SectionLabel className={styles.routinesLabel}>Today&rsquo;s routines</SectionLabel>
      <button className={styles.routineCard} onClick={() => navigate('/routines')}>
        <ProgressRing value={doneCount} max={total} size={44} />
        <div>
          <div className={styles.summaryTitle}>
            {doneCount} of {total} done
          </div>
          <div className={styles.summarySub}>
            {maxStreak > 0 ? `${maxStreak}-day streak` : 'No streak yet'}
          </div>
        </div>
      </button>
    </Screen>
  )
}
