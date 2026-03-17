import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { Canvas } from '@react-three/fiber'
import { Navigation } from './components/ui/Navigation'
import { RouteSync } from './components/ui/RouteSync'
import { LandingExperience } from './components/canvas/LandingExperience'
import { GameUI } from './components/ui/GameUI'
import { SchedulePage } from './components/ui/SchedulePage'
import { ShopPage } from './components/ui/ShopPage'
import { ProductDetail } from './components/ui/ProductDetail'
import { CommunityPage } from './components/ui/CommunityPage'
import { RadioPage } from './components/ui/community/RadioPage'
import { ClinicPage } from './components/ui/community/ClinicPage'
import { ExperiencesPage } from './components/ui/community/ExperiencesPage'
import { ExcursionsPage } from './components/ui/community/ExcursionsPage'
import { CommunityDayPage } from './components/ui/community/CommunityDayPage'
import { LeaguePage } from './components/ui/community/LeaguePage'
import { ManifestoPage } from './components/ui/ManifestoPage'
import { EmailSubscribe } from './components/ui/EmailSubscribe'
import { useReducedMotion } from './hooks/useReducedMotion'
import './App.css'

function App() {
  useReducedMotion()

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <RouteSync />

      {/* Persistent 3D canvas */}
      <div className="scene-canvas">
        <Canvas
          dpr={[1, 1.5]}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          camera={{ position: [0, -8, 6], fov: 45 }}
        >
          <LandingExperience />
        </Canvas>
      </div>

      {/* Persistent DOM overlays — self-gate based on cameraMode/route */}
      <GameUI />
      <SchedulePage />
      <CommunityPage />
      <ShopPage />
      <ManifestoPage />

      <Navigation />
      <EmailSubscribe />
      <Routes>
        {/* / and /schedule are handled by the persistent canvas + overlays */}
        <Route path="/" element={null} />
        <Route path="/schedule" element={null} />
        {/* /shop is handled by the persistent ShopPage overlay */}
        <Route path="/shop" element={null} />
        <Route path="/shop/:id" element={<ProductDetail />} />
        {/* /community is handled by the persistent CommunityPage overlay */}
        <Route path="/community" element={null} />
        <Route path="/community/radio" element={<RadioPage />} />
        <Route path="/community/clinic" element={<ClinicPage />} />
        <Route path="/community/experiences" element={<ExperiencesPage />} />
        <Route path="/community/excursions" element={<ExcursionsPage />} />
        <Route path="/community/community-day" element={<CommunityDayPage />} />
        <Route path="/community/league" element={<LeaguePage />} />
<Route path="/manifesto" element={null} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
