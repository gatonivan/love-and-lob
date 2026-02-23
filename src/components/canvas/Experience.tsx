import { Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  AdaptiveDpr,
  AdaptiveEvents,
  Environment,
  PerformanceMonitor,
} from '@react-three/drei'
import { HeroScene } from './scenes/HeroScene'
import { useWheelScroll } from '../../hooks/useWheelScroll'
import { useShopTransition } from '../../hooks/useShopTransition'
import { PostProcessing } from './effects/PostProcessing'

/** Pumps useWheelScroll each frame so scroll velocity is tracked */
function ScrollVelocityTracker() {
  const { getOffset } = useWheelScroll()
  useFrame(() => { getOffset() })
  return null
}

function ShopTransitionController() {
  useShopTransition()
  return null
}

export function Experience() {
  return (
    <>
      <color attach="background" args={['#000000']} />

      <PerformanceMonitor
        flipflops={3}
        onFallback={() => console.log('[perf] Fallback triggered')}
      >
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
      </PerformanceMonitor>

      <Environment preset="studio" background={false} environmentIntensity={0.2} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[2, 3, 8]} intensity={0.2} />
      <directionalLight position={[-2, 1, 6]} intensity={0.1} color="#b0c4ff" />

      <ScrollVelocityTracker />
      <ShopTransitionController />
      <Suspense fallback={null}>
        <HeroScene />
      </Suspense>

      <PostProcessing />
    </>
  )
}
