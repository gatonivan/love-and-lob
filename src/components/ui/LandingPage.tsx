import { Canvas } from '@react-three/fiber'
import { LandingExperience } from '../canvas/LandingExperience'
import { GameUI } from './GameUI'
import './LandingPage.css'

export function LandingPage() {
  return (
    <div className="landing-page">
      <div className="landing-canvas">
        <Canvas
          dpr={[1, 1.5]}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          camera={{ position: [0, -8, 6], fov: 45 }}
        >
          <LandingExperience />
        </Canvas>
      </div>
      <GameUI />
    </div>
  )
}
