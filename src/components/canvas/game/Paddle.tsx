import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'
import { PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_Y, COLOR_PADDLE } from './constants'

interface PaddleProps {
  paddleX: React.RefObject<number>
}

export function Paddle({ paddleX }: PaddleProps) {
  const meshRef = useRef<Mesh>(null)

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.x = paddleX.current
    }
  })

  return (
    <mesh ref={meshRef} position={[0, PADDLE_Y, 0]}>
      <boxGeometry args={[PADDLE_WIDTH, PADDLE_HEIGHT, 0.15]} />
      <meshStandardMaterial color={COLOR_PADDLE} />
    </mesh>
  )
}
