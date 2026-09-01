import type { DayCard } from './swapMeetData'

interface DayCardsProps {
  days: DayCard[]
}

/**
 * Both days render every slot, so the two bodies sit on one baseline instead
 * of drifting when one has a bill and the other does not.
 */
export function DayCards({ days }: DayCardsProps) {
  return (
    <ul className="sm-days">
      {days.map((d) => (
        <li key={d.when} className="sm-day">
          <p className="sm-day-when">{d.when}</p>
          <h3 className="sm-day-title">{d.title}</h3>
          <p className="sm-day-room">{d.room}</p>
          <p className="sm-day-time">{d.time}</p>
          <p className="sm-day-body">{d.body}</p>
          {d.lineup && (
            <div className="sm-bill">
              {d.billMark && (
                <img className="sm-bill-mark" src={d.billMark.image} alt={d.billMark.alt} />
              )}
              <ol className="sm-bill-list">
                {d.lineup.map((slot) => (
                  <li key={slot.name} className="sm-bill-slot">
                    <p className="sm-bill-time">{slot.time}</p>
                    <h4 className="sm-bill-name">{slot.name}</h4>
                    <p className="sm-bill-blurb">{slot.blurb}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
