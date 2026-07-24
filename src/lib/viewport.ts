/**
 * Keep `--app-height` in sync with the VISUAL viewport height. The app root is
 * sized to this var, so when the on-screen keyboard opens the layout shrinks and
 * the bottom action bar / nav ride up above the keyboard instead of hiding
 * behind it. (iOS in particular overlays the keyboard rather than resizing the
 * layout viewport, so `100dvh` alone isn't enough.)
 */
export function initViewportHeight(): void {
  const vv = window.visualViewport
  const apply = () => {
    const h = vv ? vv.height : window.innerHeight
    document.documentElement.style.setProperty('--app-height', `${Math.round(h)}px`)
  }
  apply()
  if (vv) {
    vv.addEventListener('resize', apply)
    vv.addEventListener('scroll', apply)
  }
  window.addEventListener('orientationchange', apply)
}
