import { NavLink } from 'react-router-dom'
import { HomeIcon, RoutinesIcon, SettingsIcon, TasksIcon } from '@/components/icons'
import { NautilusMark } from '@/components/Logo'
import { cn } from '@/lib/cn'
import { useAuth } from '@/auth/useAuth'
import styles from './Sidebar.module.css'

const ITEMS = [
  { to: '/', label: 'Home', Icon: HomeIcon, end: true },
  { to: '/tasks', label: 'Tasks', Icon: TasksIcon, end: false },
  { to: '/routines', label: 'Routines', Icon: RoutinesIcon, end: false },
  { to: '/settings', label: 'Settings', Icon: SettingsIcon, end: false },
] as const

/** Desktop-only left nav rail (≥900px). Mobile uses the bottom nav. */
export function Sidebar() {
  const { user } = useAuth()
  const name = user?.displayName ?? 'You'

  return (
    <nav className={styles.rail}>
      <div className={styles.logo}>
        <NautilusMark size={30} />
        <span className={styles.wordmark}>today-ish</span>
      </div>

      {ITEMS.map(({ to, label, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => cn(styles.item, isActive && styles.active)}
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}

      <div className={styles.spacer} />

      <div className={styles.user}>
        {user?.photoURL ? (
          <img className={styles.avatar} src={user.photoURL} alt="" referrerPolicy="no-referrer" />
        ) : (
          <div className={styles.avatar} />
        )}
        <span className={styles.userName}>{name}</span>
      </div>
    </nav>
  )
}
