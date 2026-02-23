import { useRef, useMemo, useCallback } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { gsap } from 'gsap'
import { useFeltMaterial } from '../shaders/feltMaterial'
import { useSceneStore } from '../../../stores/sceneStore'

interface TennisBallProps {
  position?: [number, number, number]
  subdivisions?: number
}

const MAX_STRETCH = 0.5
const OVER_STRETCH_THRESHOLD = 0.85

export function TennisBall({
  position = [0, 0, 0],
  subdivisions = 128,
}: TennisBallProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const { material, uniforms } = useFeltMaterial()

  // Interaction refs — never trigger React re-renders
  const isGrabbing = useRef(false)
  const grabPoint = useRef(new THREE.Vector3())
  const dragStart = useRef(new THREE.Vector3())
  const overStretchFired = useRef(false)

  const setBallDeformAmount = useSceneStore((s) => s.setBallDeformAmount)

  // High-subdivision icosahedron with merged vertices for tangent computation
  const geometry = useMemo(() => {
    const ico = new THREE.IcosahedronGeometry(1, subdivisions)
    const merged = mergeVertices(ico)
    merged.computeTangents()
    return merged
  }, [subdivisions])

  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (!meshRef.current) return

    isGrabbing.current = true
    overStretchFired.current = false

    // Get grab point in local space
    const localPoint = meshRef.current.worldToLocal(e.point.clone())
    grabPoint.current.copy(localPoint)
    dragStart.current.copy(e.point)

    // Set shader uniforms
    uniforms.uGrabPoint.value.copy(localPoint)
    uniforms.uGrabStrength.value = 1.0
    uniforms.uDragDelta.value.set(0, 0, 0)

    // Capture pointer for reliable move/up events
    ;(e.nativeEvent.target as HTMLElement)?.setPointerCapture?.(e.nativeEvent.pointerId)
  }, [uniforms])

  const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!isGrabbing.current || !meshRef.current) return
    e.stopPropagation()

    // Compute drag delta in local space
    const currentWorld = e.point.clone()
    const delta = currentWorld.sub(dragStart.current)

    // Transform delta direction into local space (rotation only)
    const inverseMatrix = new THREE.Matrix4()
      .copy(meshRef.current.matrixWorld)
      .invert()
    const localDelta = delta.clone().transformDirection(inverseMatrix)

    uniforms.uDragDelta.value.copy(localDelta)

    // Check over-stretch
    const stretchMag = localDelta.length()
    if (stretchMag > MAX_STRETCH * OVER_STRETCH_THRESHOLD && !overStretchFired.current) {
      overStretchFired.current = true
      setBallDeformAmount(1)
    }
  }, [uniforms, setBallDeformAmount])

  const handlePointerUp = useCallback(() => {
    if (!isGrabbing.current) return
    isGrabbing.current = false

    // Elastic snap-back via GSAP
    gsap.to(uniforms.uDragDelta.value, {
      x: 0,
      y: 0,
      z: 0,
      duration: 0.8,
      ease: 'elastic.out(1, 0.3)',
    })

    gsap.to(uniforms.uGrabStrength, {
      value: 0,
      duration: 0.6,
      delay: 0.4,
      ease: 'power2.out',
    })

    // Reset deform amount after snap-back completes
    if (overStretchFired.current) {
      setTimeout(() => setBallDeformAmount(0), 1200)
    }
  }, [uniforms, setBallDeformAmount])

  // Update time uniform each frame
  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.getElapsedTime()
  })

  return (
    <mesh
      ref={meshRef}
      position={position}
      geometry={geometry}
      material={material}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    />
  )
}
