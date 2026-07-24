import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScoreHeadline } from '@/components/domain/ScoreHeadline'
import { TaskCard } from '@/components/domain/TaskCard'
import { TaskFilters, DEFAULT_TASK_FILTERS } from '@/components/domain/TaskFilters'
import type { TaskFilterState } from '@/components/domain/TaskFilters'
import { BottomNav } from '@/components/layout/BottomNav'
import { Screen } from '@/components/layout/Screen'
import { Button } from '@/components/ui/Button'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { useData } from '@/data/DataProvider'
import { SHOW_SCORES } from '@/lib/features'
import { PROFILE_OPTIONS } from '@/lib/profileOptions'
import type { UrgencyTier } from '@/lib/scoring'
import {
  matchesDueDate,
  matchesProfile,
  matchesStatus,
  matchesTimeframe,
} from '@/lib/taskFilters'
import { buildTaskView, sumBleed, sumLive } from '@/lib/views'
import { useProfile } from '@/state/ProfileContext'
import { useNow } from '@/state/useNow'
import styles from './TasksScreen.module.css'

const TIER_RANK: Record<UrgencyTier, number> = { red: 0, amber: 1, green: 2 }

export function TasksScreen() {
  const navigate = useNavigate()
  const { filter, setFilter } = useProfile()
  const { tasks } = useData()
  const now = useNow() // keep scores/urgency live while the tab is open
  const [filters, setFilters] = useState<TaskFilterState>(DEFAULT_TASK_FILTERS)

  // Category chips reflect the categories present in the current profile.
  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const t of tasks) {
      if (matchesProfile(t.profile, filter) && t.category) set.add(t.category)
    }
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [tasks, filter])

  const rows = useMemo(() => {
    return tasks
      .filter(
        (t) =>
          matchesProfile(t.profile, filter) &&
          matchesStatus(t, filters.status) &&
          matchesTimeframe(t, now, filters.timeframe) &&
          matchesDueDate(t, filters.dueDate) &&
          (filters.category === 'all' || t.category === filters.category),
      )
      .map((t) => ({ id: t.id, view: buildTaskView(t, now), done: t.status === 'completed' }))
      .sort(
        (a, b) =>
          Number(a.done) - Number(b.done) || // completed sink to the bottom
          TIER_RANK[a.view.tier] - TIER_RANK[b.view.tier] ||
          b.view.live - a.view.live,
      )
  }, [tasks, filter, filters, now])

  const activeViews = useMemo(
    () => rows.filter((r) => !r.done).map((r) => r.view),
    [rows],
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
          <ScoreHeadline potential={sumLive(activeViews)} bleed={sumBleed(activeViews)} compact />
        </div>
      )}

      <TaskFilters value={filters} onChange={setFilters} categories={categories} />

      {rows.length > 0 ? (
        rows.map((r) => (
          <TaskCard
            key={r.id}
            task={r.view}
            done={r.done}
            onClick={() => navigate(`/tasks/${r.id}`)}
          />
        ))
      ) : (
        <div className={styles.empty}>No tasks match these filters.</div>
      )}
    </Screen>
  )
}
