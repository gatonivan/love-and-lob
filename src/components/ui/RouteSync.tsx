import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { useSceneStore } from '../../stores/sceneStore'

export function RouteSync() {
  const pathname = useLocation().pathname
  const setCameraMode = useSceneStore((s) => s.setCameraMode)

  useEffect(() => {
    const mode =
      pathname === '/schedule' ? 'birdseye' :
      pathname === '/invitational' ? 'birdseye' :
      pathname.startsWith('/community') ? 'referee' :
      pathname === '/manifesto' ? 'umpire' :
      pathname.startsWith('/shop') ? 'shop' :
      'game'
    setCameraMode(mode)

    // Keep the boot-time background flag from index.html in sync so body/#root
    // stay deep green on /invitational and revert to cream everywhere else.
    if (pathname === '/invitational') {
      document.documentElement.dataset.page = 'invitational'
    } else {
      delete document.documentElement.dataset.page
      document.documentElement.style.removeProperty('background')
    }
  }, [pathname, setCameraMode])

  return null
}
