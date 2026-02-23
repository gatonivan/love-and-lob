import { Canvas } from '@react-three/fiber'
import { BrowserRouter, Routes, Route } from 'react-router'
import { Experience } from './components/canvas/Experience'
import { Navigation } from './components/ui/Navigation'
import { FooterNav } from './components/ui/FooterNav'
import { HiddenLayer } from './components/ui/HiddenLayer'
import { SoundToggle } from './components/ui/SoundToggle'
import { ShopGrid } from './components/ui/ShopGrid'
import { ProductDetail } from './components/ui/ProductDetail'
import { useReducedMotion } from './hooks/useReducedMotion'
import './App.css'

function HomePage() {
  return (
    <div className="canvas-container">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 6], fov: 45 }}
      >
        <Experience />
      </Canvas>
    </div>
  )
}

function App() {
  useReducedMotion()

  return (
    <BrowserRouter>
      <Navigation />
      <HiddenLayer />
      <SoundToggle />
      <FooterNav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopGrid />} />
        <Route path="/shop/:id" element={<ProductDetail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
