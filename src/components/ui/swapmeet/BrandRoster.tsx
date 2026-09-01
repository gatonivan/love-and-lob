import type { RosterBrand } from './swapMeetData'

interface BrandRosterProps {
  brands: RosterBrand[]
}

/**
 * A flowing wordmark strip rather than an even grid — reads like the credit
 * line on a poster, and absorbs an odd brand count without leaving a hole.
 */
export function BrandRoster({ brands }: BrandRosterProps) {
  return (
    <ul className="sm-roster">
      {brands.map((b) => (
        <li key={b.name} className="sm-roster-item">
          {b.logo ? (
            <img className="sm-roster-logo" src={b.logo} alt={b.name} loading="lazy" />
          ) : (
            <span className="sm-roster-name">{b.name}</span>
          )}
        </li>
      ))}
    </ul>
  )
}
