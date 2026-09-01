import type { ExpectItem } from './swapMeetData'

interface ExpectGridProps {
  items: ExpectItem[]
}

/**
 * An indexed editorial list, not a card grid. Six things read as a run sheet
 * for the day; three-across cards would read as three unrelated features.
 */
export function ExpectGrid({ items }: ExpectGridProps) {
  return (
    <ol className="sm-expect">
      {items.map((item, i) => (
        <li key={item.title} className="sm-expect-item">
          <span className="sm-expect-index" aria-hidden="true">
            {String(i + 1).padStart(2, '0')}
          </span>
          <h3 className="sm-expect-title">{item.title}</h3>
          <p className="sm-expect-body">{item.body}</p>
        </li>
      ))}
    </ol>
  )
}
