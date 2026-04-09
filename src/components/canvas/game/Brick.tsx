import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Edges } from '@react-three/drei'
import type { Mesh, LineBasicMaterial } from 'three'
import { BRICK_WIDTH, BRICK_HEIGHT } from './constants'

interface BrickProps {
  position: [number, number, number]
  color: string
  alive: boolean
}

const BREAK_DURATION = 0.15

export function Brick({ position, color, alive }: BrickProps) {
  const meshRef = useRef<Mesh>(null)
  const edgeMatRef = useRef<LineBasicMaterial>(null)
  const prevAlive = useRef(alive)
  const breakTimer = useRef(-1)

  useFrame((_, delta) => {
    if (!meshRef.current) return

    // Detect alive→dead transition (break)
    if (prevAlive.current && !alive) {
      breakTimer.current = 0
    }

    // Detect dead→alive transition (new level) — reset everything
    if (!prevAlive.current && alive) {
      breakTimer.current = -1
      meshRef.current.visible = true
      meshRef.current.scale.set(1, 1, 1)
      if (edgeMatRef.current) edgeMatRef.current.opacity = 1
      prevAlive.current = alive
      return
    }

    prevAlive.current = alive

    if (breakTimer.current >= 0) {
      // Animating break
      breakTimer.current += delta
      const progress = Math.min(breakTimer.current / BREAK_DURATION, 1)

      if (progress >= 1) {
        // Animation done — hide and stop processing
        meshRef.current.visible = false
        return
      }

      const scale = 1 - progress
      meshRef.current.scale.set(scale, scale, scale)
      if (edgeMatRef.current) edgeMatRef.current.opacity = 1 - progress
    } else {
      // Normal state — only update when needed
      if (meshRef.current.visible !== alive) {
        meshRef.current.visible = alive
      }
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[BRICK_WIDTH, BRICK_HEIGHT, 0.12]} />
      <meshStandardMaterial transparent opacity={0} />
      <Edges threshold={15} color={color}>
        <lineBasicMaterial ref={edgeMatRef} color={color} transparent />
      </Edges>
    </mesh>
  )
}
