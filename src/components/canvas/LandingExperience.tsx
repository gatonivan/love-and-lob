import { Suspense, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  AdaptiveDpr,
  AdaptiveEvents,
  PerformanceMonitor,
} from '@react-three/drei'
import { Vector3 } from 'three'
import { damp3 } from 'maath/easing'
import { BreakoutGame } from './game/BreakoutGame'
import { TennisCourt } from './game/TennisCourt'
import { PostProcessing } from './effects/PostProcessing'
import { useSceneStore } from '../../stores/sceneStore'
import { ARENA_WIDTH, ARENA_HEIGHT } from './game/constants'

// Camera angle: looking from behind the baseline, elevated — tennis court perspective
const LOOK_AT = new Vector3(0, 0, 0)
const GAME_DIR = new Vector3(0, -8, 6).normalize()
const BIRDSEYE_DIR = new Vector3(0, 0, 1) // straight down
const FOV = 45
const HALF_TAN = Math.tan((FOV * Math.PI / 180) / 2)

// Fitting constraints
const REQ_WIDTH = ARENA_WIDTH + 1.0
const REQ_HEIGHT = ARENA_HEIGHT + 2
const PADDLE_FORWARD_OFFSET = 2.4

function computeDistance(aspect: number): number {
  const distForWidth = REQ_WIDTH / (2 * HALF_TAN * aspect) + PADDLE_FORWARD_OFFSET
  const distForHeight = REQ_HEIGHT / (2 * HALF_TAN)
  return Math.max(distForWidth, distForHeight)
}

const SETTLE_THRESHOLD = 0.05

/** Smoothly transitions camera between game and bird's-eye positions */
function CameraController() {
  const size = useThree((s) => s.size)
  const cameraMode = useSceneStore((s) => s.cameraMode)
  const reducedMotion = useSceneStore((s) => s.reducedMotion)
  const initialized = useRef(false)
  const targetPos = useRef(new Vector3())

  useFrame(({ camera }, delta) => {
    const aspect = size.width / size.height
    const dist = computeDistance(aspect)

    const dir = cameraMode === 'birdseye' ? BIRDSEYE_DIR : GAME_DIR
    targetPos.current.copy(dir).multiplyScalar(dist).add(LOOK_AT)

    if (!initialized.current || reducedMotion) {
      camera.position.copy(targetPos.current)
      camera.lookAt(LOOK_AT)
      initialized.current = true
      if (!useSceneStore.getState().cameraSettled) {
        useSceneStore.getState().setCameraSettled(true)
      }
      return
    }

    damp3(camera.position, targetPos.current, 0.25, delta)
    camera.lookAt(LOOK_AT)

    // Check if camera has arrived at target
    const distance = camera.position.distanceTo(targetPos.current)
    const settled = useSceneStore.getState().cameraSettled
    if (distance < SETTLE_THRESHOLD && !settled) {
      useSceneStore.getState().setCameraSettled(true)
    }
  })

  return null
}

export function LandingExperience() {
  const cameraMode = useSceneStore((s) => s.cameraMode)

  return (
    <>
      <color attach="background" args={['#0a0a0a']} />

      <PerformanceMonitor flipflops={3}>
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
      </PerformanceMonitor>

      <CameraController />

      <ambientLight intensity={0.4} />
      <directionalLight position={[0, -5, 10]} intensity={0.3} />
      <directionalLight position={[-3, 2, 8]} intensity={0.15} color="#b0c4ff" />

      <Suspense fallback={null}>
        <TennisCourt />
        {cameraMode === 'game' && <BreakoutGame />}
      </Suspense>

      <PostProcessing />
    </>
  )
}
