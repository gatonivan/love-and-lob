import { Suspense } from 'react'
import {
  AdaptiveDpr,
  AdaptiveEvents,
  Environment,
  PerformanceMonitor,
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
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow />
      <directionalLight position={[-3, 3, -3]} intensity={0.5} color="#b0c4ff" />
      <pointLight position={[0, -2, 4]} intensity={0.4} color="#ffe0b0" />
      <spotLight position={[0, 5, 5]} angle={0.4} penumbra={0.5} intensity={0.6} color="#ffffff" />

      <ScrollAnimator />
      <Suspense fallback={null}>
        <HeroScene />
        <CourtScene />
        <JumbotronScene />
      </Suspense>

      <PostProcessing />
    </>
  )
}
