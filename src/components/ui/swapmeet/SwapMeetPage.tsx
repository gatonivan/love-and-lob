import { Link } from 'react-router'
import { useBottomScroll } from '../../../hooks/useBottomScroll'
import { SubPageWrapper } from '../community/SubPageWrapper'
import { swapMeetData } from './swapMeetData'
import { SwapMeetHero } from './SwapMeetHero'
import { DayCards } from './DayCards'
import { ExpectGrid } from './ExpectGrid'
import { BrandRoster } from './BrandRoster'
import './swapmeet.css'

export function SwapMeetPage() {
  useBottomScroll(true)
  const d = swapMeetData

  return (
    <SubPageWrapper className="sm-page" contentClassName="sm-content">
      <Link to="/schedule" className="sm-back">&larr; Schedule</Link>

      <SwapMeetHero data={d} />

      <section className="sm-section sm-lead">
        {d.intro.map((p) => (
          <p key={p} className="sm-intro">{p}</p>
        ))}
        <p className="sm-kicker">{d.kicker}</p>
      </section>

      <section className="sm-section">
        <h2 className="sm-h2">Two nights, two rooms</h2>
        <DayCards days={d.days} />
      </section>

      <section className="sm-section">
        <h2 className="sm-h2">What to expect</h2>
        <ExpectGrid items={d.expect} />
      </section>

      <section className="sm-section">
        <h2 className="sm-h2">In the room</h2>
        <BrandRoster brands={d.roster} />
      </section>

      <section className="sm-section sm-close">
        <div className="sm-close-block">
          <h2 className="sm-h2">Getting there</h2>
          <p className="sm-venue-name">{d.venue.name}</p>
          <p className="sm-venue-line">{d.venue.address}</p>
          <p className="sm-venue-line">{d.dateLabel}</p>
          <a className="sm-link" href={d.venue.mapUrl} target="_blank" rel="noreferrer">
            Open the venue in Maps
          </a>
        </div>

        <div className="sm-close-block">
          <h2 className="sm-h2">Vend or partner</h2>
          <p className="sm-intro">
            Want a booth in the courtyard, or your product in the room? Reach out and
            let&rsquo;s build.
          </p>
          <a className="sm-link" href={`mailto:${d.contact.email}`}>
            Email {d.contact.email}
          </a>
          <a className="sm-link" href={d.contact.instagramUrl} target="_blank" rel="noreferrer">
            Follow {d.contact.instagram}
          </a>
        </div>
      </section>
    </SubPageWrapper>
  )
}
