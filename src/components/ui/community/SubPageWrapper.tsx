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

  // Intercept all link clicks within sub-pages to add exit animation
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    const link = target.closest('a[href]') as HTMLAnchorElement | null
    if (!link) return

    const href = link.getAttribute('href')
    // Only intercept internal links (not external ones like Spotify)
    if (!href || href.startsWith('http') || href.startsWith('mailto')) return

    e.preventDefault()
    useSceneStore.getState().setPageExiting(true)
    setTimeout(() => {
      useSceneStore.getState().setPageExiting(false)
      navigate(href)
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
