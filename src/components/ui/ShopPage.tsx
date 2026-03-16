import { useRef } from 'react'
import { useLocation } from 'react-router'
import { useSceneStore } from '../../stores/sceneStore'
import { useDeferredUnmount } from '../../hooks/useDeferredUnmount'
import { useBottomScroll } from '../../hooks/useBottomScroll'
import { ShopGrid } from './ShopGrid'
import './ShopPage.css'

export function ShopPage() {
  const pathname = useLocation().pathname
  const settled = useSceneStore(
    (s) => s.cameraMode === 'shop' && s.cameraSettled
  )
  const active = pathname === '/shop'
  const [shouldRender, isVisible] = useDeferredUnmount(active)
  const show = isVisible && settled
  const overlayRef = useRef<HTMLDivElement>(null)

  useBottomScroll(active, overlayRef)

  if (!shouldRender) return null

  return (
    <div ref={overlayRef} className={`shop-overlay ${show ? 'shop-overlay--visible' : ''}`}>
      <div className={`shop-overlay-content ${show ? 'shop-overlay-content--visible' : ''}`}>
        <ShopGrid />
      </div>
    </div>
  )
}
