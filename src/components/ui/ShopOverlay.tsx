import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { useSceneStore } from '../../stores/sceneStore'
import { ShopGrid } from './ShopGrid'
import './ShopOverlay.css'

export function ShopOverlay() {
  const overlayRef = useRef<HTMLDivElement>(null)
  const shopVisible = useSceneStore((s) => s.shopVisible)

  useEffect(() => {
    if (!overlayRef.current) return

    if (shopVisible) {
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out',
        onStart: () => {
          if (overlayRef.current) overlayRef.current.style.pointerEvents = 'auto'
        },
      })
    } else {
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          if (overlayRef.current) overlayRef.current.style.pointerEvents = 'none'
        },
      })
    }
  }, [shopVisible])

  return (
    <div
      ref={overlayRef}
      className="shop-overlay"
      style={{ opacity: 0, pointerEvents: 'none' }}
    >
      <div className="shop-overlay-scrim" />
      <div className="shop-overlay-content">
        <ShopGrid />
      </div>
    </div>
  )
}
