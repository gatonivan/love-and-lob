import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router'
import { Experience } from './components/canvas/Experience'
import { Navigation } from './components/ui/Navigation'
import { ShopOverlay } from './components/ui/ShopOverlay'
import { EventsOverlay } from './components/ui/EventsOverlay'
import { ProductDetail } from './components/ui/ProductDetail'
import { useReducedMotion } from './hooks/useReducedMotion'
import { useSceneStore } from './stores/sceneStore'
import './App.css'

/** Detects browser back/forward and triggers reverse zoom if needed */
function RouteWatcher() {
  const location = useLocation()
  const shopVisible = useSceneStore((s) => s.shopVisible)
  const isTransitioningToShop = useSceneStore((s) => s.isTransitioningToShop)

  useEffect(() => {
    if (!location.pathname.startsWith('/shop') && shopVisible) {
      useSceneStore.getState().setIsTransitioningFromShop(true)
      useSceneStore.getState().setShopVisible(false)
    }

    if (location.pathname === '/shop' && !shopVisible && !isTransitioningToShop) {
      useSceneStore.getState().setShopVisible(true)
      useSceneStore.getState().setCurrentSection('shop')
    }
  }, [location.pathname])

  return null
}

function App() {
  useReducedMotion()
  const [eventsOpen, setEventsOpen] = useState(false)

  return (
    <BrowserRouter>
      <RouteWatcher />
      <Navigation onEventsClick={() => setEventsOpen(true)} />

      <div className="canvas-container">
        <Canvas
          dpr={[1, 1.5]}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          camera={{ position: [0, 0, 6], fov: 45 }}
        >
          <Experience />
        </Canvas>
      </div>

      <ShopOverlay />
      <EventsOverlay visible={eventsOpen} onClose={() => setEventsOpen(false)} />

      <Routes>
        <Route path="/shop/:id" element={<ProductDetail />} />
        <Route path="*" element={null} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
