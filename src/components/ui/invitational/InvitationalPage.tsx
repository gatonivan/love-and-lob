import { Link } from 'react-router'
import { useBottomScroll } from '../../../hooks/useBottomScroll'
import { SubPageWrapper } from '../community/SubPageWrapper'
import { invitationalData } from './invitationalData'
import './invitational.css'

export function InvitationalPage() {
  useBottomScroll(true)
  const d = invitationalData

  return (
    <SubPageWrapper className="inv-page" contentClassName="inv-content">
      <Link to="/community" className="inv-back">&larr; Community</Link>

      {/* Sections added in later tasks */}
      <section className="inv-section inv-section--stub">
        <h1>{d.name}</h1>
        {d.feat && <p>ft. {d.feat}</p>}
        <p>{d.dateLabel} · {d.timeLabel}</p>
        <p>{d.venue.address}</p>
      </section>
    </SubPageWrapper>
  )
}
