import type { SwapMeetData } from './swapMeetData'

interface MarketplaceProps {
  day: SwapMeetData['marketplace']
}

/** Friday. The run of show takes the right-hand column the poster holds above. */
export function Marketplace({ day }: MarketplaceProps) {
  return (
    <section className="sm-section sm-day-section">
      <div className="sm-day-body-col">
        <p className="sm-day-when">{day.when}</p>
        <h2 className="sm-h2">{day.title}</h2>
        <p className="sm-day-room">{day.room}</p>
        <p className="sm-day-time">{day.time}</p>
        {day.body.map((p) => (
          <p key={p} className="sm-intro">{p}</p>
        ))}
      </div>

      <div className="sm-run">
        <h3 className="sm-run-heading">Run of show</h3>
        <ol className="sm-run-list">
          {day.runOfShow.map((item) => (
            <li key={item.time} className="sm-run-item">
              <p className="sm-run-time">{item.time}</p>
              <div>
                <p className="sm-run-label">{item.label}</p>
                {item.note && <p className="sm-run-note">{item.note}</p>}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
