import { useEffect, useRef, useState } from 'react'
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
  const [mounted, setMounted] = useState(false)

  // Re-trigger when the ref element appears
  useEffect(() => {
    if (!active) {
      setMounted(false)
      return
    }
    // Poll briefly for the element to appear in the DOM
    const interval = setInterval(() => {
      if (!elementRef || elementRef.current) {
        setMounted(true)
        clearInterval(interval)
      }
    }, 50)
    // Fallback — stop polling after 2s
    const fallback = setTimeout(() => {
      setMounted(true)
      clearInterval(interval)
    }, 2000)
    return () => {
      clearInterval(interval)
      clearTimeout(fallback)
    }
  }, [active, elementRef])

  useEffect(() => {
    if (!active || !mounted) {
      if (!active) {
        useSceneStore.getState().setOverlayScrolled(false)
        useSceneStore.getState().setLogoHidden(false)
      }
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
  }, [active, mounted, elementRef])
}
