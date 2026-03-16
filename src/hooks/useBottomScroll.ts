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
      let scrollMax: number
      let scrollPos: number

      if (el) {
        scrollMax = el.scrollHeight - el.clientHeight
        scrollPos = el.scrollTop
      } else {
        scrollMax = document.documentElement.scrollHeight - window.innerHeight
        scrollPos = window.scrollY
      }

      // Content isn't scrollable — show links
      // Content is scrollable — only show at bottom
      const atBottom = scrollMax <= 10
        ? scrollMax <= 10 && scrollPos <= 10
          ? false  // not enough content rendered yet, keep hidden
          : true
        : scrollPos >= scrollMax - 40

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
