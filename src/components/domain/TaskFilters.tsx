import { useState } from 'react'
import { FilterIcon } from '@/components/icons'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { cn } from '@/lib/cn'
import type { StatusFilter, TimeframeFilter } from '@/lib/taskFilters'
import styles from './TaskFilters.module.css'

export interface TaskFilterState {
  status: StatusFilter
  timeframe: TimeframeFilter
  /** 'all' or a specific category */
  category: string
  /** '' or an ISO YYYY-MM-DD date */
  dueDate: string
}

export const DEFAULT_TASK_FILTERS: TaskFilterState = {
  status: 'active',
  timeframe: 'all',
  category: 'all',
  dueDate: '',
}

export function activeFilterCount(f: TaskFilterState): number {
  let n = 0
  if (f.status !== 'active') n += 1
  if (f.timeframe !== 'all') n += 1
  if (f.category !== 'all') n += 1
  if (f.dueDate) n += 1
  return n
}

const STATUS_OPTS: ReadonlyArray<{ value: StatusFilter; label: string }> = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'all', label: 'All' },
]

const TIMEFRAME_OPTS: ReadonlyArray<{ value: TimeframeFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'later', label: 'Later' },
]

function cap(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s
}

export function TaskFilters({
  value,
  onChange,
  categories,
}: {
  value: TaskFilterState
  onChange: (next: TaskFilterState) => void
  categories: string[]
}) {
  const [open, setOpen] = useState(false)
  const count = activeFilterCount(value)
  const set = (patch: Partial<TaskFilterState>) => onChange({ ...value, ...patch })

  return (
    <div className={styles.wrap}>
      <button
        className={cn(styles.toggle, open && styles.open)}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <FilterIcon size={18} />
        Filters
        {count > 0 && <span className={styles.badge}>{count}</span>}
        <span className={styles.chev}>{open ? '▾' : '▸'}</span>
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.group}>
            <SectionLabel small className={styles.label}>
              Status
            </SectionLabel>
            <div className={styles.chips}>
              {STATUS_OPTS.map((o) => (
                <button
                  key={o.value}
                  className={cn(styles.chip, value.status === o.value && styles.chipSelected)}
                  onClick={() => set({ status: o.value })}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.group}>
            <SectionLabel small className={styles.label}>
              When
            </SectionLabel>
            <div className={styles.chips}>
              {TIMEFRAME_OPTS.map((o) => (
                <button
                  key={o.value}
                  className={cn(styles.chip, value.timeframe === o.value && styles.chipSelected)}
                  onClick={() => set({ timeframe: o.value })}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {categories.length > 0 && (
            <div className={styles.group}>
              <SectionLabel small className={styles.label}>
                Category
              </SectionLabel>
              <div className={styles.chips}>
                <button
                  className={cn(styles.chip, value.category === 'all' && styles.chipSelected)}
                  onClick={() => set({ category: 'all' })}
                >
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c}
                    className={cn(styles.chip, value.category === c && styles.chipSelected)}
                    onClick={() => set({ category: c })}
                  >
                    {cap(c)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={styles.group}>
            <SectionLabel small className={styles.label}>
              Due on
            </SectionLabel>
            <div className={styles.dateRow}>
              <input
                type="date"
                className={styles.dateInput}
                value={value.dueDate}
                onChange={(e) => set({ dueDate: e.target.value })}
              />
              {value.dueDate && (
                <button className={styles.clear} onClick={() => set({ dueDate: '' })}>
                  Clear
                </button>
              )}
            </div>
          </div>

          {count > 0 && (
            <button className={styles.reset} onClick={() => onChange(DEFAULT_TASK_FILTERS)}>
              Reset filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
