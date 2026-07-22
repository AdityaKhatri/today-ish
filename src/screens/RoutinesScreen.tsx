import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon } from '@/components/icons'
import { RoutineRow } from '@/components/domain/RoutineRow'
import { BottomNav } from '@/components/layout/BottomNav'
import { Screen } from '@/components/layout/Screen'
import { Card } from '@/components/ui/Card'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { useData } from '@/data/DataProvider'
import { PROFILE_OPTIONS } from '@/lib/profileOptions'
import { matchesProfile } from '@/lib/taskFilters'
import { buildRoutineView, isRoutineDone, routineActiveOn } from '@/lib/views'
import { useProfile } from '@/state/ProfileContext'
import { useNow } from '@/state/useNow'
import styles from './RoutinesScreen.module.css'

export function RoutinesScreen() {
  const navigate = useNavigate()
  const { filter, setFilter } = useProfile()
  const { routines, todayLogs, setRoutineDone } = useData()
  const now = useNow()

  const { rows, doneCount, total, maxStreak } = useMemo(() => {
    const nowDate = new Date(now)
    const dow = nowDate.getDay()
    const active = routines.filter(
      (r) => matchesProfile(r.profile, filter) && routineActiveOn(r, dow),
    )
    const built = active.map((r) => ({
      routine: r,
      view: buildRoutineView(r, todayLogs[r.id], nowDate),
    }))
    return {
      rows: built,
      doneCount: built.filter((b) => b.view.status === 'done').length,
      total: built.length,
      maxStreak: active.reduce((m, r) => Math.max(m, r.currentStreak), 0),
    }
  }, [routines, todayLogs, filter, now])

  return (
    <Screen footer={<BottomNav />} contentClassName={styles.content}>
      <div className={styles.header}>
        <div className={styles.title}>Routines</div>
        <button
          className={styles.addBtn}
          aria-label="New routine"
          onClick={() => navigate('/routines/new')}
        >
          <PlusIcon size={20} />
        </button>
      </div>

      <div className={styles.switcher}>
        <SegmentedControl options={PROFILE_OPTIONS} value={filter} onChange={setFilter} />
      </div>

      <Card className={styles.summary}>
        <ProgressRing value={doneCount} max={total} size={56} />
        <div>
          <div className={styles.summaryNum}>
            {doneCount} / {total}
          </div>
          <div className={styles.summarySub}>
            {maxStreak > 0 ? `${maxStreak}-day streak` : 'No streak yet'}
          </div>
        </div>
      </Card>

      {rows.length > 0 ? (
        rows.map(({ routine, view }) => (
          <RoutineRow
            key={routine.id}
            routine={view}
            onToggle={() => setRoutineDone(routine, !isRoutineDone(routine, todayLogs[routine.id]))}
          />
        ))
      ) : (
        <div className={styles.empty}>No routines for today in this profile.</div>
      )}
    </Screen>
  )
}
