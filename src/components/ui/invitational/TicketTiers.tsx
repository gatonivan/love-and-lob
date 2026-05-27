import type { TicketTier } from './invitationalData'

interface TicketTiersProps {
  tickets: TicketTier[]
}

export function TicketTiers({ tickets }: TicketTiersProps) {
  return (
    <section className="inv-section">
      <h2 className="inv-h2">Tickets</h2>
      <div className="inv-tickets">
        {tickets.map((t) => (
          <article key={t.title} className="inv-ticket">
            <div className="inv-ticket-head">
              <h3>{t.title}</h3>
              {t.status === 'sold-out' && <span className="inv-badge-soldout">Sold Out</span>}
            </div>
            {t.prices.map((p) => (
              <p key={p} className="inv-ticket-price">{p}</p>
            ))}
            <p className="inv-ticket-label">What&apos;s Included?</p>
            <ul className="inv-ticket-list">
              {t.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {t.status === 'available' && t.cta && (
              <a className="inv-ticket-cta" href={t.cta.href}>{t.cta.label}</a>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
