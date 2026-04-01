import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Edges } from '@react-three/drei'
import type { Mesh } from 'three'
import { PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_Y, COLOR_COURT_LINE } from './constants'

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
      <meshStandardMaterial color={COLOR_COURT_LINE} transparent opacity={0.45} />
      <Edges threshold={15} color={COLOR_COURT_LINE}>
        <lineBasicMaterial color={COLOR_COURT_LINE} />
      </Edges>
    </mesh>
  )
}
