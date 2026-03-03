import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { useSceneStore } from '../../stores/sceneStore'

export function RouteSync() {
  const pathname = useLocation().pathname
  const setCameraMode = useSceneStore((s) => s.setCameraMode)

  useEffect(() => {
    setCameraMode(pathname === '/schedule' ? 'birdseye' : 'game')
  }, [pathname, setCameraMode])

  return null
}
