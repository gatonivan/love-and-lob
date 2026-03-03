import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { Navigation } from './components/ui/Navigation'
import { LandingPage } from './components/ui/LandingPage'
import { ShopPage } from './components/ui/ShopPage'
import { ProductDetail } from './components/ui/ProductDetail'
import { SchedulePage } from './components/ui/SchedulePage'
import { WordsPage } from './components/ui/WordsPage'
import { ManifestoPage } from './components/ui/ManifestoPage'
import { useReducedMotion } from './hooks/useReducedMotion'
import './App.css'

function App() {
  useReducedMotion()

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Navigation />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/shop/:id" element={<ProductDetail />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/words" element={<WordsPage />} />
        <Route path="/manifesto" element={<ManifestoPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
