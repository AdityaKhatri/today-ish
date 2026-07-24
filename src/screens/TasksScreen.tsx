import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScoreHeadline } from '@/components/domain/ScoreHeadline'
import { TaskCard } from '@/components/domain/TaskCard'
import { BottomNav } from '@/components/layout/BottomNav'
import { Screen } from '@/components/layout/Screen'
import { Button } from '@/components/ui/Button'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { useData } from '@/data/DataProvider'
import { SHOW_SCORES } from '@/lib/features'
import { PROFILE_OPTIONS } from '@/lib/profileOptions'
import type { UrgencyTier } from '@/lib/scoring'
import { matchesProfile } from '@/lib/taskFilters'
import { buildTaskView, sumBleed, sumLive } from '@/lib/views'
import { useProfile } from '@/state/ProfileContext'
import { useNow } from '@/state/useNow'
import styles from './TasksScreen.module.css'

const TIER_RANK: Record<UrgencyTier, number> = { red: 0, amber: 1, green: 2 }

export function TasksScreen() {
  const navigate = useNavigate()
  const { filter, setFilter } = useProfile()
  const { tasks } = useData()
  const now = useNow() // keep scores live while the tab is open

  const views = useMemo(
    () =>
      tasks
        .filter((t) => matchesProfile(t.profile, filter))
        .map((t) => buildTaskView(t, now))
        .sort((a, b) => TIER_RANK[a.tier] - TIER_RANK[b.tier] || b.live - a.live),
    [tasks, filter, now],
  )

  const footer = (
    <>
      <div className={styles.addBar}>
        <Button fullWidth onClick={() => navigate('/add')}>
          + Add task
        </Button>
      </div>
      <BottomNav />
    </>
  )

  return (
    <Screen footer={footer} contentClassName={styles.content}>
      <div className={styles.title}>Tasks</div>
      <div className={styles.switcher}>
        <SegmentedControl options={PROFILE_OPTIONS} value={filter} onChange={setFilter} large />
      </div>
      {SHOW_SCORES && (
        <div className={styles.score}>
          <ScoreHeadline potential={sumLive(views)} bleed={sumBleed(views)} compact />
        </div>
      )}

      {views.length > 0 ? (
        views.map((t) => (
          <TaskCard key={t.id} task={t} onClick={() => navigate(`/tasks/${t.id}`)} />
        ))
      ) : (
        <div className={styles.empty}>No tasks here yet. Add one to get started.</div>
      )}
    </Screen>
  )
}
