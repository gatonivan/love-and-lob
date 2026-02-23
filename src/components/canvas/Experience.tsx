import { Suspense } from 'react'
import {
  AdaptiveDpr,
  AdaptiveEvents,
  Environment,
  PerformanceMonitor,
  ScrollControls,
} from '@react-three/drei'
import { HeroScene } from './scenes/HeroScene'
import { CourtScene } from './scenes/CourtScene'
import { JumbotronScene } from './scenes/JumbotronScene'
import { ScrollAnimator } from './ScrollAnimator'
import { PostProcessing } from './effects/PostProcessing'

export function Experience() {
  return (
    <>
      <PerformanceMonitor
        flipflops={3}
        onFallback={() => console.log('[perf] Fallback triggered')}
      >
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
      </PerformanceMonitor>

      <Environment preset="studio" />
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-3, 3, -3]} intensity={0.4} color="#b0c4ff" />
      <pointLight position={[0, -2, 3]} intensity={0.3} color="#ffe0b0" />

      <ScrollControls pages={5} damping={0.15}>
        <ScrollAnimator />
        <Suspense fallback={null}>
          <HeroScene />
          <CourtScene />
          <JumbotronScene />
        </Suspense>
      </ScrollControls>

      <PostProcessing />
    </>
  )
}
