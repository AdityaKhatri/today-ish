import { AppRoutes } from '@/app/AppRoutes'
import { Splash } from '@/components/Splash'
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

  if (status === 'loading' || status === 'checking') return <Splash />
  if (status === 'signedOut') return <SignInScreen />
  if (status === 'denied') return <NotAuthorizedScreen />
  return <AppRoutes />
}
