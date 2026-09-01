import type { DayCard } from './swapMeetData'

interface DayCardsProps {
  days: DayCard[]
}

/**
 * Both cards render every slot, so the two bodies sit on one baseline instead
 * of drifting when one day has a door time and the other does not.
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
        </li>
      ))}
    </ul>
  )
}
