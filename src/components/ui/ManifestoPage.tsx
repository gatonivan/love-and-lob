import { useLocation } from 'react-router'
import { useSceneStore } from '../../stores/sceneStore'
import './ManifestoPage.css'

export function ManifestoPage() {
  const pathname = useLocation().pathname
  const settled = useSceneStore((s) => s.cameraMode === 'umpire' && s.cameraSettled)

  if (pathname !== '/manifesto') return null

  return (
    <div className={`manifesto-overlay ${settled ? 'manifesto-overlay--visible' : ''}`}>
      <div className={`manifesto-content ${settled ? 'manifesto-content--visible' : ''}`}>
        <h1 className="manifesto-title">Manifesto</h1>
        <p className="manifesto-placeholder">Coming soon.</p>
      </div>
    </div>
  )
}
