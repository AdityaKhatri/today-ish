import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon } from '@/components/icons'
import { Wordmark } from '@/components/Logo'
import { AskAiFab } from '@/components/domain/AskAiFab'
import { MorningBriefCard } from '@/components/domain/MorningBriefCard'
import { ScoreHeadline } from '@/components/domain/ScoreHeadline'
import { TaskCard } from '@/components/domain/TaskCard'
import { BottomNav } from '@/components/layout/BottomNav'
import { Screen } from '@/components/layout/Screen'
import { OfflineBadge } from '@/components/ui/OfflineBadge'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { useAuth } from '@/auth/useAuth'
import { formatLongDate } from '@/lib/dates'
import { PROFILE_OPTIONS } from '@/lib/profileOptions'
import type { UrgencyTier } from '@/lib/scoring'
import {
  MOCK_ROUTINES,
  MOCK_TASKS,
  filterByProfile,
  sumBleed,
  sumPotential,
} from '@/mock/fixtures'
import { useProfile } from '@/state/ProfileContext'
import { useNow } from '@/state/useNow'
import styles from './HomeScreen.module.css'

const TIER_RANK: Record<UrgencyTier, number> = { red: 0, amber: 1, green: 2 }

export function HomeScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { filter, setFilter } = useProfile()
  const now = useNow() // re-render each minute so scores/urgency stay live

  const firstName = user?.displayName?.split(' ')[0] ?? 'there'

  const tasks = useMemo(() => filterByProfile(MOCK_TASKS, filter), [filter])
  const topPriorities = useMemo(
    () =>
      [...tasks]
        .sort((a, b) => TIER_RANK[a.tier] - TIER_RANK[b.tier] || b.bleed - a.bleed)
        .slice(0, 4),
    [tasks],
  )
  const routines = useMemo(() => filterByProfile(MOCK_ROUTINES, filter), [filter])
  const doneCount = routines.filter((r) => r.status === 'done').length

  return (
    <Screen footer={<BottomNav />} overlay={<AskAiFab />} contentClassName={styles.content}>
      <div className={styles.topbar}>
        <Wordmark size={16} />
        <OfflineBadge />
      </div>

      <div className={styles.greetingRow}>
        <div>
          <div className={styles.greeting}>Hi, {firstName}</div>
          <div className={styles.date}>{formatLongDate(new Date(now))}</div>
        </div>
        <button
          className={styles.addBtn}
          aria-label="Add task"
          onClick={() => navigate('/add')}
        >
          <PlusIcon size={24} />
        </button>
      </div>

      <MorningBriefCard />

      <div className={styles.score}>
        <ScoreHeadline potential={sumPotential(tasks)} bleed={sumBleed(tasks)} />
      </div>

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
        <ProgressRing value={doneCount} max={routines.length} size={44} />
        <div>
          <div className={styles.summaryTitle}>
            {doneCount} of {routines.length} done
          </div>
          <div className={styles.summarySub}>12-day streak · 86% hit rate</div>
        </div>
      </button>
    </Screen>
  )
}
