import { useNavigate } from 'react-router'
import { useSceneStore } from '../../stores/sceneStore'
import './Navigation.css'

export function Navigation() {
  const navigate = useNavigate()
  const shopVisible = useSceneStore((s) => s.shopVisible)
  const scheduleVisible = useSceneStore((s) => s.scheduleVisible)
  const isTransitioning = useSceneStore(
    (s) =>
      s.isTransitioningToShop ||
      s.isTransitioningFromShop ||
      s.isTransitioningToSchedule ||
      s.isTransitioningFromSchedule
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
    if (scheduleVisible) {
      useSceneStore.getState().setIsTransitioningFromSchedule(true)
      useSceneStore.getState().setScheduleVisible(false)
      return
    }
    navigate('/')
  }

  const handleScheduleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (scheduleVisible || isTransitioning) return
    useSceneStore.getState().setCurrentSection('schedule-transition')
    useSceneStore.getState().setIsTransitioningToSchedule(true)
  }

  return (
    <nav className="nav">
      <div className="nav-logo" onClick={handleHomeClick} style={{ cursor: 'pointer' }}>
        Love & Lob
      </div>
      <div className="nav-links">
        <a href="/" onClick={handleHomeClick}>Home</a>
        <a href="/shop" onClick={handleShopClick}>Shop</a>
        <a href="#schedule" onClick={handleScheduleClick}>Schedule</a>
      </div>
    </nav>
  )
}
