import { useNavigate } from 'react-router'
import { useSceneStore } from '../../stores/sceneStore'
import './Navigation.css'

interface NavigationProps {
  onEventsClick: () => void
}

export function Navigation({ onEventsClick }: NavigationProps) {
  const navigate = useNavigate()
  const shopVisible = useSceneStore((s) => s.shopVisible)
  const isTransitioning = useSceneStore(
    (s) => s.isTransitioningToShop || s.isTransitioningFromShop
  )

  const handleShopClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (shopVisible || isTransitioning) return
    useSceneStore.getState().setCurrentSection('shop-transition')
    useSceneStore.getState().setIsTransitioningToShop(true)
    navigate('/shop')
  }

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isTransitioning) return
    if (shopVisible) {
      useSceneStore.getState().setIsTransitioningFromShop(true)
      useSceneStore.getState().setShopVisible(false)
      navigate('/')
      return
    }
    navigate('/')
  }

  const handleEventsClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onEventsClick()
  }

  return (
    <nav className="nav">
      <div className="nav-logo" onClick={handleHomeClick} style={{ cursor: 'pointer' }}>
        Love & Lob
      </div>
      <div className="nav-links">
        <a href="/" onClick={handleHomeClick}>Home</a>
        <a href="/shop" onClick={handleShopClick}>Shop</a>
        <a href="#events" onClick={handleEventsClick}>Events</a>
      </div>
    </nav>
  )
}
