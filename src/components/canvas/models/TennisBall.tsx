import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useSceneStore } from '../../../stores/sceneStore'

interface TennisBallProps {
  position?: [number, number, number]
  scale?: number
}

export function TennisBall({
  position = [0, 0, 0],
  scale = 1.5,
}: TennisBallProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF(`${import.meta.env.BASE_URL}models/tennis-ball.glb`)
  const gl = useThree((s) => s.gl)

  // Center the model at origin (Sketchfab export is offset)
  // and strip specular/env highlights from baked GLB materials
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    const box = new THREE.Box3().setFromObject(clone)
    const center = box.getCenter(new THREE.Vector3())
    clone.position.sub(center)

    clone.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as THREE.MeshStandardMaterial
        mat.envMapIntensity = 0
        mat.roughness = 1
        mat.metalness = 0
        if ('clearcoat' in mat) (mat as any).clearcoat = 0
        if ('sheen' in mat) (mat as any).sheen = 0
        if (mat.metalnessMap) {
          mat.metalnessMap = null
          mat.needsUpdate = true
        }
      }
    })

    return clone
  }, [scene])

  // Hover glow light
  const glowLightRef = useRef<THREE.PointLight>(null)

  // Rotation state
  const angularVelocityY = useRef(0)
  const angularVelocityX = useRef(0)
  const rotationY = useRef(0)
  const rotationX = useRef(0)

  // Pointer drag state
  const isDragging = useRef(false)
  const lastPointer = useRef({ x: 0, y: 0 })

  // Window-level move/up listeners for reliable drag
  useEffect(() => {
    const canvas = gl.domElement

    const onMove = (e: PointerEvent) => {
      if (!isDragging.current) return
      const dx = e.clientX - lastPointer.current.x
      const dy = e.clientY - lastPointer.current.y
      lastPointer.current = { x: e.clientX, y: e.clientY }

      const DRAG_SENSITIVITY = 0.003
      angularVelocityY.current += dx * DRAG_SENSITIVITY
      angularVelocityX.current += dy * DRAG_SENSITIVITY
    }

    const onUp = () => {
      if (!isDragging.current) return
      isDragging.current = false
      canvas.style.cursor = 'grab'
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [gl])

  const onPointerDown = (e: any) => {
    e.stopPropagation()
    isDragging.current = true
    lastPointer.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY }
    gl.domElement.style.cursor = 'grabbing'
  }

  useFrame(() => {
    if (!groupRef.current) return

    const state = useSceneStore.getState()
    const section = state.currentSection
    const isShopMode = section === 'shop-transition' || section === 'shop'
    const SCROLL_SENSITIVITY = isShopMode ? 0 : 15
    const FRICTION = 0.96
    const IDLE_SPEED = isShopMode ? 0.02 : 0.08

    const velocity = state.scrollVelocity

    angularVelocityY.current += velocity * SCROLL_SENSITIVITY
    angularVelocityX.current += velocity * SCROLL_SENSITIVITY * 0.3

    angularVelocityY.current *= FRICTION
    angularVelocityX.current *= FRICTION

    const speed = Math.abs(angularVelocityY.current) + Math.abs(angularVelocityX.current)
    const idleBlend = Math.max(0, 1 - speed * 5)
    const idleY = IDLE_SPEED * 0.001
    const idleX = IDLE_SPEED * 0.0005

    rotationY.current += angularVelocityY.current + idleY * idleBlend
    rotationX.current += angularVelocityX.current + idleX * idleBlend

    groupRef.current.rotation.y = rotationY.current
    groupRef.current.rotation.x = rotationX.current

    // Smooth hover glow
    if (glowLightRef.current) {
      const hovered = state.ballHovered
      const target = hovered ? 0.6 : 0
      glowLightRef.current.intensity = THREE.MathUtils.lerp(
        glowLightRef.current.intensity,
        target,
        0.08
      )
    }
  })

  const isTransitioning = useSceneStore(
    (s) => s.isTransitioningToShop || s.isTransitioningFromShop
  )
  const currentSection = useSceneStore((s) => s.currentSection)
  const isHeroPage = currentSection === 'hero'

  return (
    <group
      ref={groupRef}
      position={position}
      scale={scale}
    >
      <primitive object={clonedScene} />
      <pointLight
        ref={glowLightRef}
        position={[0, 0, 1.5]}
        intensity={0}
        color="#d8e84d"
        distance={4}
        decay={2}
      />
      {/* Invisible sphere for reliable raycasting */}
      <mesh
        visible={false}
        onPointerDown={isTransitioning ? undefined : onPointerDown}
        onPointerOver={
          isTransitioning
            ? undefined
            : () => {
                gl.domElement.style.cursor = 'grab'
                if (isHeroPage) useSceneStore.getState().setBallHovered(true)
              }
        }
        onPointerOut={
          isTransitioning
            ? undefined
            : () => {
                if (!isDragging.current) gl.domElement.style.cursor = ''
                useSceneStore.getState().setBallHovered(false)
              }
        }
      >
        <sphereGeometry args={[1, 16, 16]} />
      </mesh>
    </group>
  )
}

useGLTF.preload(`${import.meta.env.BASE_URL}models/tennis-ball.glb`)
