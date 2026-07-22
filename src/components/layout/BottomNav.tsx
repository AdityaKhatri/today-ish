import { NavLink } from 'react-router-dom'
import { HomeIcon, TasksIcon, RoutinesIcon, SettingsIcon } from '@/components/icons'
import { cn } from '@/lib/cn'
import styles from './BottomNav.module.css'

const TABS = [
  { to: '/', label: 'Home', Icon: HomeIcon, end: true },
  { to: '/tasks', label: 'Tasks', Icon: TasksIcon, end: false },
  { to: '/routines', label: 'Routines', Icon: RoutinesIcon, end: false },
  { to: '/settings', label: 'Settings', Icon: SettingsIcon, end: false },
] as const

export function BottomNav() {
  return (
    <nav className={styles.nav}>
      {TABS.map(({ to, label, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => cn(styles.item, isActive && styles.active)}
        >
          <Icon size={20} />
          <span className={styles.label}>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
