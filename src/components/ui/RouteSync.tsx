import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { useSceneStore } from '../../stores/sceneStore'

export function RouteSync() {
  const pathname = useLocation().pathname
  const setCameraMode = useSceneStore((s) => s.setCameraMode)

  useEffect(() => {
    const mode =
      pathname === '/schedule' ? 'birdseye' :
      pathname === '/community' ? 'referee' :
      pathname === '/manifesto' ? 'umpire' :
      'game'
    setCameraMode(mode)
  }, [pathname, setCameraMode])

  return null
}
