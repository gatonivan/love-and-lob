import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { BALL_RADIUS } from './constants'

interface BallProps {
  positionRef: React.RefObject<[number, number]>
}

export function Ball({ positionRef }: BallProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF(`${import.meta.env.BASE_URL}models/tennis-ball.glb`)

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)

    // Scale first so centering is accurate after scale
    const box = new THREE.Box3().setFromObject(clone)
    const size = box.getSize(new THREE.Vector3())
    const modelRadius = Math.max(size.x, size.y, size.z) / 2
    const targetScale = BALL_RADIUS / modelRadius
    clone.scale.setScalar(targetScale)

    // Now center after scaling
    const scaledBox = new THREE.Box3().setFromObject(clone)
    const center = scaledBox.getCenter(new THREE.Vector3())
    clone.position.sub(center)

    // Strip specular/env highlights from baked GLB materials
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as THREE.MeshStandardMaterial
        mat.envMapIntensity = 0
        mat.envMap = null
        mat.roughness = 0.8
        mat.metalness = 0
        mat.metalnessMap = null
        mat.roughnessMap = null
        mat.emissive = new THREE.Color('#d8e84d')
        mat.emissiveIntensity = 0.15
        if (mat.normalMap) {
          mat.normalScale = new THREE.Vector2(0.3, 0.3)
        }
        mat.needsUpdate = true
      }
    })

    return clone
  }, [scene])

  // Gentle spin
  const rotationY = useRef(0)

  useFrame((_, delta) => {
    if (!groupRef.current) return
    groupRef.current.position.x = positionRef.current[0]
    groupRef.current.position.y = positionRef.current[1]

    rotationY.current += delta * 3
    groupRef.current.rotation.y = rotationY.current
    groupRef.current.rotation.x = rotationY.current * 0.3
  })

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  )
}

useGLTF.preload(`${import.meta.env.BASE_URL}models/tennis-ball.glb`)
