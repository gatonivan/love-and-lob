import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useSceneStore } from '../../../stores/sceneStore'

interface SubPageWrapperProps {
  children: React.ReactNode
}

export function SubPageWrapper({ children }: SubPageWrapperProps) {
  const exiting = useSceneStore((s) => s.pageExiting)
  const navigate = useNavigate()

  // Always hide the logo on community sub-pages
  useEffect(() => {
    useSceneStore.getState().setLogoHidden(true)
    // Override any delayed checks from useBottomScroll
    const id = setInterval(() => {
      useSceneStore.getState().setLogoHidden(true)
    }, 100)
    return () => {
      clearInterval(id)
      useSceneStore.getState().setLogoHidden(false)
    }
  }, [])

  // Intercept internal link clicks within sub-pages to add exit animation
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    const link = target.closest('a[href]') as HTMLAnchorElement | null
    if (!link) return

    const href = link.getAttribute('href')
    if (!href) return

    // Let external links pass through normally
    if (href.startsWith('http') || href.startsWith('mailto')) return

    // Use the `to` attribute from React Router Link if available,
    // otherwise strip the base path from the rendered href
    const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')
    const routePath = href.startsWith(basePath)
      ? href.slice(basePath.length) || '/'
      : href

    e.preventDefault()

    // Community-to-community: navigate instantly, no exit animation
    if (routePath === '/community' || routePath.startsWith('/community/')) {
      navigate(routePath)
      return
    }

    // Leaving community: play exit animation first
    useSceneStore.getState().setPageExiting(true)
    setTimeout(() => {
      useSceneStore.getState().setPageExiting(false)
      navigate(routePath)
    }, 300)
  }, [navigate])

  return (
    <div
      className={`community-sub-page${exiting ? ' community-sub-page--exiting' : ''}`}
      onClick={handleClick}
    >
      <div className="community-sub-content">
        {children}
      </div>
    </div>
  )
}
