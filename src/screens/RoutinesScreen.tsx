import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon } from '@/components/icons'
import { RoutineRow } from '@/components/domain/RoutineRow'
import { BottomNav } from '@/components/layout/BottomNav'
import { Screen } from '@/components/layout/Screen'
import { Card } from '@/components/ui/Card'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { PROFILE_OPTIONS } from '@/lib/profileOptions'
import type { RoutineStatusView } from '@/lib/views'
import { MOCK_ROUTINES, filterByProfile } from '@/mock/fixtures'
import { useProfile } from '@/state/ProfileContext'
import styles from './RoutinesScreen.module.css'

/** Optimistic local toggle so the daily view feels live before Firestore lands. */
function nextStatus(status: RoutineStatusView): RoutineStatusView {
  return status === 'done' ? 'pending' : 'done'
}

export function RoutinesScreen() {
  const navigate = useNavigate()
  const { filter, setFilter } = useProfile()
  const [overrides, setOverrides] = useState<Record<string, RoutineStatusView>>({})

  const routines = useMemo(() => {
    return filterByProfile(MOCK_ROUTINES, filter).map((r) => ({
      ...r,
      status: overrides[r.id] ?? r.status,
      sub: (overrides[r.id] ?? r.status) === 'done' ? 'done today' : r.sub,
    }))
  }, [filter, overrides])

  const doneCount = routines.filter((r) => r.status === 'done').length

  const toggle = (id: string, current: RoutineStatusView) => {
    // Instant-optimistic: flip immediately. Firestore write + streak txn later.
    setOverrides((o) => ({ ...o, [id]: nextStatus(current) }))
  }

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
        <ProgressRing value={doneCount} max={routines.length} size={56} />
        <div>
          <div className={styles.summaryNum}>
            {doneCount} / {routines.length}
          </div>
          <div className={styles.summarySub}>12-day streak · 86% hit rate</div>
        </div>
      </Card>

      {routines.length > 0 ? (
        routines.map((r) => (
          <RoutineRow key={r.id} routine={r} onToggle={() => toggle(r.id, r.status)} />
        ))
      ) : (
        <div className={styles.empty}>No routines for this profile yet.</div>
      )}
    </Screen>
  )
}
