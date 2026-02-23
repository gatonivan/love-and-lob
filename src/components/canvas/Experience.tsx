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
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 8, 5]} intensity={0.3} />
      <directionalLight position={[-3, 3, -3]} intensity={0.15} color="#b0c4ff" />

      <ScrollVelocityTracker />
      <ShopTransitionController />
      <Suspense fallback={null}>
        <HeroScene />
      </Suspense>

      <PostProcessing />
    </>
  )
}
