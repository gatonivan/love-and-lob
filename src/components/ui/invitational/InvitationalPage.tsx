import { Link } from 'react-router'
import { useBottomScroll } from '../../../hooks/useBottomScroll'
import { SubPageWrapper } from '../community/SubPageWrapper'
import { invitationalData } from './invitationalData'
import { InvitationalHero } from './InvitationalHero'
import { TicketTiers } from './TicketTiers'
import { ScheduleTimeline } from './ScheduleTimeline'
import { FaqList } from './FaqList'
import { FacilityMap } from './FacilityMap'
import './invitational.css'

export function InvitationalPage() {
  useBottomScroll(true)
  const d = invitationalData
  const titleSponsor = d.sponsors.find((s) => s.role)
  const partners = d.sponsors.filter((s) => !s.role)

  return (
    <SubPageWrapper className="inv-page" contentClassName="inv-content">
      <Link to="/schedule" className="inv-back">&larr; Schedule</Link>

      <InvitationalHero data={d} />

      <section className="inv-section inv-flyer">
        <img className="inv-flyer-img" src={d.flyer.image} alt={d.flyer.alt} />
      </section>

      <section className="inv-section">
        {d.venue.name && <p className="inv-venue">{d.venue.name}</p>}
        <p className="inv-venue">{d.venue.address}</p>
        <p className="inv-venue">{d.dateLabel} · {d.timeLabel}</p>
        {d.intro.map((p) => (
          <p key={p} className="inv-intro">{p}</p>
        ))}
      </section>

      <FacilityMap />

      <TicketTiers tickets={d.tickets} />

      <ScheduleTimeline schedule={d.schedule} />

      <section className="inv-section">
        <h2 className="inv-h2">{d.narrative.heading}</h2>
        <p className="inv-intro">{d.narrative.lead}</p>
        <div className="inv-narrative">
          {d.narrative.blocks.map((b) => (
            <div key={b.title} className="inv-narrative-block">
              <h3>{b.title}</h3>
              <ul>
                {b.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

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
        <h2 className="inv-h2">Sponsors</h2>
        {titleSponsor && (
          <div className="inv-sponsor-title">
            <p className="inv-sponsor-role">{titleSponsor.role}</p>
            <p className="inv-sponsor-name">{titleSponsor.name}</p>
            {titleSponsor.blurb && <p className="inv-sponsor-blurb">{titleSponsor.blurb}</p>}
          </div>
        )}
        <ul className="inv-sponsor-wall">
          {partners.map((s) => (
            <li key={s.name} className="inv-sponsor">
              <p className="inv-sponsor-name">{s.name}</p>
              {s.blurb && <p className="inv-sponsor-blurb">{s.blurb}</p>}
            </li>
          ))}
        </ul>
      </section>
    </SubPageWrapper>
  )
}
