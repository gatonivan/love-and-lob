import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useSceneStore } from '../stores/sceneStore'

const TOTAL_PAGES = 5
const DAMPING = 0.08

export function useWheelScroll() {
  const targetOffset = useRef(0)
  const currentOffset = useRef(0)
  const gl = useThree((s) => s.gl)
  const setScrollProgress = useSceneStore((s) => s.setScrollProgress)

  useEffect(() => {
    const canvas = gl.domElement

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      // Normalize deltaY across browsers and trackpad vs mouse
      const delta = e.deltaY * 0.0004
      targetOffset.current = THREE.MathUtils.clamp(targetOffset.current + delta, 0, 1)
    }

    canvas.addEventListener('wheel', handleWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', handleWheel)
  }, [gl])

  // Returns a function to call in useFrame
  const getOffset = () => {
    currentOffset.current = THREE.MathUtils.lerp(currentOffset.current, targetOffset.current, DAMPING)
    setScrollProgress(currentOffset.current)
    return currentOffset.current
  }

  return { getOffset, totalPages: TOTAL_PAGES }
}
