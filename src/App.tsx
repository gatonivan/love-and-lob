import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router'
import { Experience } from './components/canvas/Experience'
import { Navigation } from './components/ui/Navigation'
import { ShopOverlay } from './components/ui/ShopOverlay'
import { EventsOverlay } from './components/ui/EventsOverlay'
import { WordsOverlay } from './components/ui/WordsOverlay'
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
  const scheduleVisible = useSceneStore((s) => s.scheduleVisible)
  const wordsVisible = useSceneStore((s) => s.wordsVisible)

  const handleScheduleClose = () => {
    const state = useSceneStore.getState()
    if (state.isTransitioningFromSchedule || !state.scheduleVisible) return
    state.setIsTransitioningFromSchedule(true)
    state.setScheduleVisible(false)
  }

  const handleWordsClose = () => {
    const state = useSceneStore.getState()
    if (state.isTransitioningFromWords || !state.wordsVisible) return
    state.setIsTransitioningFromWords(true)
    state.setWordsVisible(false)
  }

  return (
    <BrowserRouter>
      <RouteWatcher />
      <Navigation />

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
      <EventsOverlay visible={scheduleVisible} onClose={handleScheduleClose} />
      <WordsOverlay visible={wordsVisible} onClose={handleWordsClose} />

      <Routes>
        <Route path="/shop/:id" element={<ProductDetail />} />
        <Route path="*" element={null} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
