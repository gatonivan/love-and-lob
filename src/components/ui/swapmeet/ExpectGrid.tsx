import type { ExpectItem } from './swapMeetData'

interface ExpectGridProps {
  items: ExpectItem[]
}

/**
 * Things that are simply there all day. Deliberately unnumbered: anything with
 * a time on it belongs in the run of show, and an index would read as an order.
 */
export function ExpectGrid({ items }: ExpectGridProps) {
  return (
    <dl className="sm-expect">
      {items.map((item) => (
        <div key={item.title} className="sm-expect-item">
          <dt className="sm-expect-title">{item.title}</dt>
          <dd className="sm-expect-body">{item.body}</dd>
        </div>
      ))}
    </dl>
  )
}
