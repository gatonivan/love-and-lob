import { useEffect } from 'react'
import { useSceneStore } from '../stores/sceneStore'

export function useReducedMotion() {
  const setReducedMotion = useSceneStore((s) => s.setReducedMotion)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [setReducedMotion])

  return useSceneStore((s) => s.reducedMotion)
}
