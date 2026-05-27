import type { ScheduleItem } from './invitationalData'

interface ScheduleTimelineProps {
  schedule: ScheduleItem[]
}

export function ScheduleTimeline({ schedule }: ScheduleTimelineProps) {
  return (
    <section className="inv-section">
      <h2 className="inv-h2">Schedule</h2>
      <ol className="inv-schedule">
        {schedule.map((s) => (
          <li key={s.time} className="inv-schedule-item">
            <span className="inv-schedule-time">{s.time}</span>
            <span className="inv-schedule-label">{s.label}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
