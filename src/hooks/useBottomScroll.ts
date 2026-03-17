import { useEffect, useRef } from 'react'
import { useSceneStore } from '../stores/sceneStore'

/**
 * Tracks scroll on an element (or window):
 * - Sets logoHidden=true when user scrolls past 40px
 * - Sets overlayScrolled=true when user reaches the bottom
 * Resets both when the page becomes inactive.
 */
export function useBottomScroll(
  active: boolean,
  elementRef?: React.RefObject<HTMLDivElement | null>
) {
  const rafId = useRef(0)

  useEffect(() => {
    if (!active) {
      useSceneStore.getState().setOverlayScrolled(false)
      useSceneStore.getState().setLogoHidden(false)
      return
    }

    const el = elementRef?.current

    function check() {
      let scrollMax: number
      let scrollPos: number

      if (el) {
        scrollMax = el.scrollHeight - el.clientHeight
        scrollPos = el.scrollTop
      } else {
        scrollMax = document.documentElement.scrollHeight - window.innerHeight
        scrollPos = window.scrollY
      }

      // Hide logo when user has scrolled at all
      useSceneStore.getState().setLogoHidden(scrollPos > 40)

      // Show nav links at bottom
      const atBottom = scrollMax > 10 && scrollPos >= scrollMax - 40
      useSceneStore.getState().setOverlayScrolled(atBottom)
    }

    const onScroll = () => {
      cancelAnimationFrame(rafId.current)
      rafId.current = requestAnimationFrame(check)
    }

    const target = el || window
    target.addEventListener('scroll', onScroll, { passive: true })

    // Delayed initial check — wait for content to render
    const initTimer = setTimeout(check, 800)

    return () => {
      target.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafId.current)
      clearTimeout(initTimer)
    }
  }, [active, elementRef])
}
