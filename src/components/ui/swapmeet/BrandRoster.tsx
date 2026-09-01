import type { RosterBrand } from './swapMeetData'

interface BrandRosterProps {
  brands: RosterBrand[]
}

export function BrandRoster({ brands }: BrandRosterProps) {
  return (
    <ul className="sm-roster">
      {brands.map((b) => (
        <li key={b.name} className="sm-roster-item">
          {b.logo ? (
            <img className="sm-roster-logo" src={b.logo} alt={b.name} loading="lazy" />
          ) : (
            <h3 className="sm-roster-name">{b.name}</h3>
          )}
          {b.blurb && <p className="sm-roster-blurb">{b.blurb}</p>}
        </li>
      ))}
    </ul>
  )
}
