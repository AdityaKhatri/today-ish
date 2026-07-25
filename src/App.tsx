import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { AppRoutes } from '@/app/AppRoutes'
import { ReminderRunner } from '@/components/ReminderRunner'
import { Splash } from '@/components/Splash'
import { UpdateSnackbar } from '@/components/UpdateSnackbar'
import { DataProvider } from '@/data/DataProvider'
import { NotAuthorizedScreen } from '@/screens/NotAuthorizedScreen'
import { SignInScreen } from '@/screens/SignInScreen'
import { useAuth } from '@/auth/useAuth'

/**
 * Top-level gate. The allowlist is verified BEFORE any app screen renders:
 * while `checking`, we show the splash — never a task/routine screen — so an
 * unlisted user is bounced before seeing anything they shouldn't.
 */
export function App() {
  const { status } = useAuth()

  // Fade out the pre-React boot splash once the app has mounted.
  useEffect(() => {
    const el = document.getElementById('boot-splash')
    if (!el) return
    el.style.opacity = '0'
    const t = window.setTimeout(() => el.remove(), 400)
    return () => window.clearTimeout(t)
  }, [])

  let content: ReactNode
  if (status === 'loading' || status === 'checking') content = <Splash />
  else if (status === 'signedOut') content = <SignInScreen />
  else if (status === 'denied') content = <NotAuthorizedScreen />
  else
    content = (
      <DataProvider>
        <ReminderRunner />
        <AppRoutes />
      </DataProvider>
    )

  return (
    <>
      {content}
      <UpdateSnackbar />
    </>
  )
}
