import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { useSceneStore } from '../../stores/sceneStore'

export function RouteSync() {
  const pathname = useLocation().pathname
  const setCameraMode = useSceneStore((s) => s.setCameraMode)

  useEffect(() => {
    const mode =
      pathname === '/schedule' ? 'birdseye' :
      pathname.startsWith('/community') ? 'referee' :
      pathname === '/manifesto' ? 'umpire' :
      pathname.startsWith('/shop') ? 'shop' :
      'game'
    setCameraMode(mode)
  }, [pathname, setCameraMode])

  return null
}
