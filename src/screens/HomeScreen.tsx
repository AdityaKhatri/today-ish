import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon } from '@/components/icons'
import { Wordmark } from '@/components/Logo'
import { RoutineRow } from '@/components/domain/RoutineRow'
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
import { formatLongDate } from '@/lib/dates'
import { PROFILE_OPTIONS } from '@/lib/profileOptions'
import type { UrgencyTier } from '@/lib/scoring'
import { matchesProfile } from '@/lib/taskFilters'
import { buildRoutineView, buildTaskView, routineActiveOn, sumBleed, sumLive } from '@/lib/views'
import { useShowScores } from '@/state/PreferencesContext'
import { useProfile } from '@/state/ProfileContext'
import { useNow } from '@/state/useNow'
import styles from './HomeScreen.module.css'

const TIER_RANK: Record<UrgencyTier, number> = { red: 0, amber: 1, green: 2 }
const DAY_MS = 24 * 60 * 60 * 1000

export function HomeScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { filter, setFilter } = useProfile()
  const { tasks, routines, todayLogs, setTaskCompleted, toggleRoutine } = useData()
  const now = useNow() // re-render each minute so scores/urgency stay live
  const showScores = useShowScores()

  const firstName = user?.displayName?.split(' ')[0] ?? 'there'

  // Active tasks + anything completed in the last 24h (so a just-checked task
  // doesn't vanish from the list immediately).
  const taskRows = useMemo(() => {
    const cutoff = now - DAY_MS
    return tasks
      .filter(
        (t) =>
          matchesProfile(t.profile, filter) &&
          (t.status === 'active' ||
            (t.status === 'completed' && (t.completedAt?.toMillis() ?? 0) >= cutoff)),
      )
      .map((t) => ({
        task: t,
        view: buildTaskView(t, now),
        done: t.status === 'completed',
        completedAt: t.completedAt?.toMillis() ?? 0,
      }))
      .sort((a, b) => {
        if (a.done !== b.done) return Number(a.done) - Number(b.done) // active first
        if (a.done) return b.completedAt - a.completedAt // most-recently-done first
        return TIER_RANK[a.view.tier] - TIER_RANK[b.view.tier] || b.view.bleed - a.view.bleed
      })
  }, [tasks, filter, now])

  const activeViews = useMemo(
    () => taskRows.filter((r) => !r.done).map((r) => r.view),
    [taskRows],
  )

  const { routineRows, doneCount, total, maxStreak } = useMemo(() => {
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
      routineRows: built,
      doneCount: built.filter((b) => b.view.status === 'done').length,
      total: built.length,
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

      {showScores && (
        <div className={styles.score}>
          <ScoreHeadline potential={sumLive(activeViews)} bleed={sumBleed(activeViews)} />
        </div>
      )}

      <div className={styles.switcher}>
        <SegmentedControl options={PROFILE_OPTIONS} value={filter} onChange={setFilter} />
      </div>

      <SectionLabel className={styles.priorityLabel}>Tasks</SectionLabel>
      {taskRows.length > 0 ? (
        taskRows.map((r) => (
          <TaskCard
            key={r.task.id}
            task={r.view}
            done={r.done}
            onToggleDone={() => void setTaskCompleted(r.task, !r.done)}
            onClick={() => navigate(`/tasks/${r.task.id}`)}
          />
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

      {routineRows.length > 0 ? (
        routineRows.map(({ routine, view }) => (
          <RoutineRow
            key={routine.id}
            routine={view}
            onToggle={() => {
              void toggleRoutine(routine).catch((e) => console.error('[routine] toggle failed', e))
            }}
          />
        ))
      ) : (
        <div className={styles.empty}>No routines for today.</div>
      )}
    </Screen>
  )
}
