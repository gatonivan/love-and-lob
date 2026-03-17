import { Link } from 'react-router'
import { useBottomScroll } from '../../../hooks/useBottomScroll'
import './community-sub.css'

export function WoodstockPage() {
  useBottomScroll(true)
  return (
    <div className="community-sub-page">
      <div className="community-sub-content">
        <Link to="/community" className="community-sub-back">
          &larr; Community
        </Link>
        <h1 className="community-sub-title">Woodstock</h1>
        <p className="community-sub-intro">
          Details coming soon.
        </p>
      </div>
    </div>
  )
}
