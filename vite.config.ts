import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { execSync } from 'node:child_process'
import path from 'node:path'

// Build-time git/build metadata (works with the shallow checkout in CI).
function git(cmd: string, fallback: string): string {
  try {
    return execSync(cmd).toString().trim()
  } catch {
    return fallback
  }
}
const BUILD_COMMIT = git('git rev-parse --short=8 HEAD', 'local')
const BUILD_MESSAGE = git('git log -1 --pretty=%s', 'local development build')
const BUILD_TIME = new Date().toISOString()

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __BUILD_COMMIT__: JSON.stringify(BUILD_COMMIT),
    __BUILD_MESSAGE__: JSON.stringify(BUILD_MESSAGE),
    __BUILD_TIME__: JSON.stringify(BUILD_TIME),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false, // we register manually in src/pwa.ts (to add update checks)
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'Today-ish',
        short_name: 'Today-ish',
        description: 'Task + routine tracker with a decaying-score mechanic.',
        lang: 'en',
        dir: 'ltr',
        theme_color: '#DCEEE9',
        background_color: '#FBEADF',
        display: 'standalone',
        display_override: ['standalone'],
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        categories: ['productivity', 'lifestyle'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          {
            src: 'icons/icon-192-maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          { src: 'icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png', purpose: 'any' },
        ],
      },
      workbox: {
        // Precache the app shell so the app loads with no network.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
