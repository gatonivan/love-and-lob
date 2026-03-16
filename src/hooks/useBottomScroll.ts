import { useEffect, useRef } from 'react'
import { useSceneStore } from '../stores/sceneStore'

/**
 * Tracks scroll position on an element (or window) and sets
 * overlayScrolled=true when the user reaches the bottom.
 * Resets to false when the page becomes inactive.
 *
 * For overlay pages: pass the overlay ref.
 * For route pages: call with no ref to track window scroll.
 */
export function useBottomScroll(
  active: boolean,
  elementRef?: React.RefObject<HTMLDivElement | null>
) {
  const rafId = useRef(0)

  useEffect(() => {
    if (!active) {
      useSceneStore.getState().setOverlayScrolled(false)
      return
    }

    const el = elementRef?.current

    function check() {
      let atBottom: boolean
      if (el) {
        const scrollMax = el.scrollHeight - el.clientHeight
        atBottom = scrollMax <= 0 || el.scrollTop >= scrollMax - 40
      } else {
        const scrollMax = document.documentElement.scrollHeight - window.innerHeight
        atBottom = scrollMax <= 0 || window.scrollY >= scrollMax - 40
      }
      useSceneStore.getState().setOverlayScrolled(atBottom)
    }

    const onScroll = () => {
      cancelAnimationFrame(rafId.current)
      rafId.current = requestAnimationFrame(check)
    }

    const target = el || window
    target.addEventListener('scroll', onScroll, { passive: true })
    check() // initial check — if content isn't scrollable, show links immediately

    return () => {
      target.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafId.current)
    }
  }, [active, elementRef])
}
