import { Link } from 'react-router'
import { useBottomScroll } from '../../../hooks/useBottomScroll'
import { SubPageWrapper } from '../community/SubPageWrapper'
import { invitationalData } from './invitationalData'
import { InvitationalHero } from './InvitationalHero'
import { TicketTiers } from './TicketTiers'
import { ScheduleTimeline } from './ScheduleTimeline'
import { FaqList } from './FaqList'
import './invitational.css'

export function InvitationalPage() {
  useBottomScroll(true)
  const d = invitationalData

  return (
    <SubPageWrapper className="inv-page" contentClassName="inv-content">
      <Link to="/community" className="inv-back">&larr; Community</Link>

      <InvitationalHero data={d} />

      <section className="inv-section">
        <p className="inv-venue">{d.venue.address}</p>
        <p className="inv-venue">{d.dateLabel} · {d.timeLabel}</p>
        {d.intro.map((p, i) => (
          <p key={i} className="inv-intro">{p}</p>
        ))}
      </section>

      <TicketTiers tickets={d.tickets} />

      <ScheduleTimeline schedule={d.schedule} />

      <section className="inv-section">
        <h2 className="inv-h2">FAQs</h2>
        <FaqList faqs={d.faqs} />

        <h2 className="inv-h2">Directions</h2>
        <div className="inv-directions">
          {d.directions.byCar && <p><strong>By Car:</strong> {d.directions.byCar}</p>}
          {d.directions.byTrain && <p><strong>By Train:</strong> {d.directions.byTrain}</p>}
          {d.directions.parking && <p><strong>Parking:</strong> {d.directions.parking}</p>}
        </div>
      </section>

      <section className="inv-section inv-sponsors">
        <h2 className="inv-h2">Sponsored By</h2>
        <ul className="inv-sponsor-list">
          {d.sponsors.map((s) => (
            <li key={s.name} className="inv-sponsor">
              {s.logo ? <img src={s.logo} alt={s.name} /> : <span>{s.name}</span>}
            </li>
          ))}
        </ul>
      </section>
    </SubPageWrapper>
  )
}
