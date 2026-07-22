import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScoreHeadline } from '@/components/domain/ScoreHeadline'
import { TaskCard } from '@/components/domain/TaskCard'
import { BottomNav } from '@/components/layout/BottomNav'
import { Screen } from '@/components/layout/Screen'
import { Button } from '@/components/ui/Button'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { PROFILE_OPTIONS } from '@/lib/profileOptions'
import type { UrgencyTier } from '@/lib/scoring'
import { MOCK_TASKS, filterByProfile, sumBleed, sumPotential } from '@/mock/fixtures'
import { useProfile } from '@/state/ProfileContext'
import { useNow } from '@/state/useNow'
import styles from './TasksScreen.module.css'

const TIER_RANK: Record<UrgencyTier, number> = { red: 0, amber: 1, green: 2 }

export function TasksScreen() {
  const navigate = useNavigate()
  const { filter, setFilter } = useProfile()
  useNow() // keep scores live while the tab is open

  const tasks = useMemo(
    () =>
      filterByProfile(MOCK_TASKS, filter).sort(
        (a, b) => TIER_RANK[a.tier] - TIER_RANK[b.tier] || b.live - a.live,
      ),
    [filter],
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
      <div className={styles.score}>
        <ScoreHeadline potential={sumPotential(tasks)} bleed={sumBleed(tasks)} compact />
      </div>

      {tasks.length > 0 ? (
        tasks.map((t) => (
          <TaskCard key={t.id} task={t} onClick={() => navigate(`/tasks/${t.id}`)} />
        ))
      ) : (
        <div className={styles.empty}>No tasks here yet. Add one to get started.</div>
      )}
    </Screen>
  )
}
