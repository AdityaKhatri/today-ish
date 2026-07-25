import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import { AuthProvider } from '@/auth/AuthProvider'
import { PreferencesProvider } from '@/state/PreferencesContext'
import { ProfileProvider } from '@/state/ProfileContext'
import { initViewportHeight } from '@/lib/viewport'
import { setupPWA } from './pwa'
import '@/state/installPrompt' // attach the beforeinstallprompt listener ASAP
import './styles/global.css'

initViewportHeight()
setupPWA()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProfileProvider>
          <PreferencesProvider>
            <App />
          </PreferencesProvider>
        </ProfileProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
