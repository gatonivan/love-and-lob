import type { InvitationalData } from './invitationalData'

interface HeroProps {
  data: Pick<InvitationalData, 'name' | 'feat' | 'scriptLine' | 'dateBadge'>
}

export function InvitationalHero({ data }: HeroProps) {
  const { weekday, month, day } = data.dateBadge
  return (
    <header className="inv-hero">
      <p className="inv-hero-script">{data.scriptLine}</p>
      <h1 className="inv-hero-title">{data.name}</h1>
      <div className="inv-hero-badge" aria-hidden="true">
        <span className="inv-hero-badge-weekday">{weekday}</span>
        <span className="inv-hero-badge-day">{day}</span>
        <span className="inv-hero-badge-month">{month}</span>
      </div>
      {data.feat && <p className="inv-hero-feat">ft. {data.feat}</p>}
    </header>
  )
}
