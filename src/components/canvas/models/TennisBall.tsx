import { useRef, useMemo, useCallback, useEffect } from 'react'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { gsap } from 'gsap'
import { useFeltMaterial } from '../shaders/feltMaterial'
import { useSceneStore } from '../../../stores/sceneStore'

interface TennisBallProps {
  position?: [number, number, number]
  subdivisions?: number
  scale?: number
}

const MAX_STRETCH = 1.5
const OVER_STRETCH_THRESHOLD = 0.85

export function TennisBall({
  position = [0, 0, 0],
  subdivisions = 128,
  scale = 1.5,
}: TennisBallProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const { material, uniforms } = useFeltMaterial()
  const { camera, gl } = useThree()

  // Interaction refs
  const isGrabbing = useRef(false)
  const grabPoint = useRef(new THREE.Vector3())
  const dragStartScreen = useRef(new THREE.Vector2())
  const overStretchFired = useRef(false)

  const setBallDeformAmount = useSceneStore((s) => s.setBallDeformAmount)

  // High-subdivision icosahedron with merged vertices for tangent computation
  const geometry = useMemo(() => {
    const ico = new THREE.IcosahedronGeometry(1, subdivisions)
    const merged = mergeVertices(ico)
    merged.computeTangents()
    return merged
  }, [subdivisions])

  // Convert screen coordinates to a world-space drag delta
  const screenToWorldDelta = useCallback((clientX: number, clientY: number) => {
    if (!meshRef.current) return new THREE.Vector3()

    const rect = gl.domElement.getBoundingClientRect()
    const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1
    const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1
    const startNdcX = (dragStartScreen.current.x / rect.width) * 2 - 1
    const startNdcY = -(dragStartScreen.current.y / rect.height) * 2 + 1

    // Project the NDC delta into world space at the ball's depth
    const ballWorldPos = new THREE.Vector3()
    meshRef.current.getWorldPosition(ballWorldPos)
    const depth = ballWorldPos.distanceTo(camera.position)

    // Scale factor: how much world-space movement per NDC unit at this depth
    const fov = (camera as THREE.PerspectiveCamera).fov
    const aspect = (camera as THREE.PerspectiveCamera).aspect
    const halfHeight = Math.tan(THREE.MathUtils.degToRad(fov / 2)) * depth
    const halfWidth = halfHeight * aspect

    const worldDeltaX = (ndcX - startNdcX) * halfWidth
    const worldDeltaY = (ndcY - startNdcY) * halfHeight

    // Convert from camera-space delta to world-space delta
    const right = new THREE.Vector3()
    const up = new THREE.Vector3()
    camera.matrixWorld.extractBasis(right, up, new THREE.Vector3())

    return right.multiplyScalar(worldDeltaX).add(up.multiplyScalar(worldDeltaY))
  }, [camera, gl])

  // Window-level pointer move handler (works even when pointer leaves the ball)
  const handleWindowPointerMove = useCallback((e: PointerEvent) => {
    if (!isGrabbing.current || !meshRef.current) return

    const worldDelta = screenToWorldDelta(e.clientX, e.clientY)

    // Transform to local space using Matrix3 (preserves magnitude)
    // NOTE: transformDirection() normalizes the result, which destroys magnitude — don't use it
    const inverseMatrix = new THREE.Matrix4()
      .copy(meshRef.current.matrixWorld)
      .invert()
    const localRotScale = new THREE.Matrix3().setFromMatrix4(inverseMatrix)
    const localDelta = worldDelta.applyMatrix3(localRotScale)

    // Clamp magnitude to MAX_STRETCH
    const mag = localDelta.length()
    if (mag > MAX_STRETCH) {
      localDelta.multiplyScalar(MAX_STRETCH / mag)
    }

    uniforms.uDragDelta.value.copy(localDelta)

    // Check over-stretch
    if (mag > MAX_STRETCH * OVER_STRETCH_THRESHOLD && !overStretchFired.current) {
      overStretchFired.current = true
      setBallDeformAmount(1)
    }
  }, [uniforms, setBallDeformAmount, screenToWorldDelta])

  // Window-level pointer up handler
  const handleWindowPointerUp = useCallback(() => {
    if (!isGrabbing.current) return
    isGrabbing.current = false
    document.body.style.cursor = ''

    // Remove window listeners
    window.removeEventListener('pointermove', handleWindowPointerMove)
    window.removeEventListener('pointerup', handleWindowPointerUp)

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

    if (overStretchFired.current) {
      setTimeout(() => setBallDeformAmount(0), 1200)
    }
  }, [uniforms, setBallDeformAmount, handleWindowPointerMove])

  // Initial grab on the ball mesh (R3F raycasting)
  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (!meshRef.current) return

    isGrabbing.current = true
    overStretchFired.current = false
    document.body.style.cursor = 'grabbing'

    // Store grab point in local space for shader
    const localPoint = meshRef.current.worldToLocal(e.point.clone())
    grabPoint.current.copy(localPoint)

    // Store screen-space start position for delta calculation
    const rect = gl.domElement.getBoundingClientRect()
    dragStartScreen.current.set(
      e.nativeEvent.clientX - rect.left,
      e.nativeEvent.clientY - rect.top
    )

    // Set shader uniforms
    uniforms.uGrabPoint.value.copy(localPoint)
    uniforms.uGrabStrength.value = 1.0
    uniforms.uDragDelta.value.set(0, 0, 0)

    // Attach window-level listeners for reliable drag tracking
    window.addEventListener('pointermove', handleWindowPointerMove)
    window.addEventListener('pointerup', handleWindowPointerUp)
  }, [uniforms, gl, handleWindowPointerMove, handleWindowPointerUp])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove)
      window.removeEventListener('pointerup', handleWindowPointerUp)
    }
  }, [handleWindowPointerMove, handleWindowPointerUp])

  // Update time uniform + idle animation each frame
  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.getElapsedTime()

    // Subtle idle animation when not grabbed
    if (meshRef.current && !isGrabbing.current) {
      const t = clock.getElapsedTime()
      meshRef.current.rotation.y = Math.sin(t * 0.3) * 0.08
      meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.04
    }
  })

  return (
    <group ref={groupRef} position={position}>
      <mesh
        ref={meshRef}
        scale={scale}
        geometry={geometry}
        material={material}
        onPointerDown={handlePointerDown}
        onPointerOver={() => { if (!isGrabbing.current) document.body.style.cursor = 'grab' }}
        onPointerOut={() => { if (!isGrabbing.current) document.body.style.cursor = '' }}
      />
    </group>
  )
}
