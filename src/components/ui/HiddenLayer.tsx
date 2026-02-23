import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { useSceneStore } from '../../stores/sceneStore'
import './HiddenLayer.css'

export function HiddenLayer() {
  const overlayRef = useRef<HTMLDivElement>(null)
  const ballDeformAmount = useSceneStore((s) => s.ballDeformAmount)
  const setBallDeformAmount = useSceneStore((s) => s.setBallDeformAmount)

  useEffect(() => {
    if (!overlayRef.current) return

    if (ballDeformAmount >= 1) {
      gsap.to(overlayRef.current, {
        opacity: 1,
        visibility: 'visible',
        duration: 0.6,
        ease: 'power2.out',
      })
    } else {
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => {
          if (overlayRef.current) {
            overlayRef.current.style.visibility = 'hidden'
          }
        },
      })
    }
  }, [ballDeformAmount])

  const handleDismiss = () => {
    setBallDeformAmount(0)
  }

  return (
    <div
      ref={overlayRef}
      className="hidden-layer"
      onClick={handleDismiss}
      role="dialog"
      aria-label="Hidden content revealed by stretching the tennis ball"
    >
      <div className="hidden-layer-content" onClick={(e) => e.stopPropagation()}>
        <div className="hidden-layer-eyebrow">You found it.</div>
        <h2 className="hidden-layer-title">The Court Is Yours</h2>
        <p className="hidden-layer-body">
          Love & Lob isn't just a brand. It's a statement.
          Every swing, every serve, every moment on the court
          is an act of self-expression.
        </p>
        <div className="hidden-layer-cta">
          <span className="hidden-layer-code">DROP-001</span>
          <span className="hidden-layer-hint">Coming soon</span>
        </div>
        <button className="hidden-layer-close" onClick={handleDismiss}>
          Close
        </button>
      </div>
    </div>
  )
}
