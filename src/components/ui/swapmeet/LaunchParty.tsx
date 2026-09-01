import type { SwapMeetData } from './swapMeetData'

interface LaunchPartyProps {
  day: SwapMeetData['launchParty']
}

/**
 * Thursday night. The party has its own poster, so it sits beside the copy
 * here rather than competing with the Swap Meet flyer up in the hero.
 */
export function LaunchParty({ day }: LaunchPartyProps) {
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

        <div className="sm-bill">
          <img className="sm-bill-mark" src={day.mark.image} alt={day.mark.alt} />
          <ol className="sm-bill-list">
            {day.lineup.map((slot) => (
              <li key={slot.name} className="sm-bill-slot">
                <p className="sm-bill-time">{slot.time}</p>
                <h3 className="sm-bill-name">{slot.name}</h3>
                <p className="sm-bill-blurb">{slot.blurb}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <img className="sm-day-flyer" src={day.flyer.image} alt={day.flyer.alt} loading="lazy" />
    </section>
  )
}
