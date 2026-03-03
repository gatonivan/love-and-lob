import { Suspense, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  AdaptiveDpr,
  AdaptiveEvents,
  PerformanceMonitor,
} from '@react-three/drei'
import { Vector3 } from 'three'
import { BreakoutGame } from './game/BreakoutGame'
import { PostProcessing } from './effects/PostProcessing'
import { ARENA_WIDTH, ARENA_HEIGHT } from './game/constants'

// Camera angle: looking from behind the baseline, elevated — tennis court perspective
const LOOK_AT = new Vector3(0, 0, 0)
const CAM_DIR = new Vector3(0, -8, 6).normalize() // direction from look-at to camera
const FOV = 45
const HALF_TAN = Math.tan((FOV * Math.PI / 180) / 2)

// Fitting constraints
const REQ_WIDTH = ARENA_WIDTH + 1.0
const REQ_HEIGHT = ARENA_HEIGHT + 2
// With the tilted camera, the paddle (closest point) is 2.4 units closer
// along the camera's forward axis than the look-at center
const PADDLE_FORWARD_OFFSET = 2.4

/** Positions camera along the tilted direction, scaling distance so the arena fits */
function CameraFitter() {
  const size = useThree((s) => s.size)
  const lastDist = useRef(0)

  useFrame(({ camera }) => {
    const aspect = size.width / size.height

    // Width constraint: paddle row is closest to camera, appears widest
    // Visible width at paddle = 2 * (D - offset) * tan(hfov/2)
    // hfov half-tan = HALF_TAN * aspect
    const distForWidth = REQ_WIDTH / (2 * HALF_TAN * aspect) + PADDLE_FORWARD_OFFSET

    // Height constraint (approximate — the tilt foreshortens vertically)
    const distForHeight = REQ_HEIGHT / (2 * HALF_TAN)

    const dist = Math.max(distForWidth, distForHeight)

    if (Math.abs(dist - lastDist.current) > 0.05) {
      const pos = CAM_DIR.clone().multiplyScalar(dist).add(LOOK_AT)
      camera.position.set(pos.x, pos.y, pos.z)
      camera.lookAt(LOOK_AT)
      lastDist.current = dist
    }
  })

  return null
}

export function LandingExperience() {
  return (
    <>
      <color attach="background" args={['#0a0a0a']} />

      <PerformanceMonitor flipflops={3}>
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
      </PerformanceMonitor>

      <CameraFitter />

      <ambientLight intensity={0.4} />
      <directionalLight position={[0, -5, 10]} intensity={0.3} />
      <directionalLight position={[-3, 2, 8]} intensity={0.15} color="#b0c4ff" />

      <Suspense fallback={null}>
        <BreakoutGame />
      </Suspense>

      <PostProcessing />
    </>
  )
}
