import { useState } from 'react'
import type { MapZone } from './invitationalData'

interface FacilityMapProps {
  image?: string
  alt: string
  zones: MapZone[]
}

export function FacilityMap({ image, alt, zones }: FacilityMapProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  return (
    <section className="inv-section">
      <h2 className="inv-h2">Facility Map</h2>
      <div className="inv-map">
        <div className="inv-map-canvas">
          {image && <img className="inv-map-img" src={image} alt={alt} />}
          {zones.map((z) => (
            <button
              key={z.id}
              type="button"
              className={`inv-map-zone${activeId === z.id ? ' inv-map-zone--active' : ''}`}
              style={{ left: `${z.hotspot.x}%`, top: `${z.hotspot.y}%`, width: `${z.hotspot.w}%`, height: `${z.hotspot.h}%` }}
              onMouseEnter={() => setActiveId(z.id)}
              onMouseLeave={() => setActiveId(null)}
              onClick={() => setActiveId((cur) => (cur === z.id ? null : z.id))}
              aria-label={z.label}
            >
              <span className="inv-map-zone-tag">{z.label}</span>
            </button>
          ))}
        </div>
        <ul className="inv-map-legend">
          {zones.map((z) => (
            <li
              key={z.id}
              className={`inv-map-legend-item${activeId === z.id ? ' inv-map-legend-item--active' : ''}`}
              onMouseEnter={() => setActiveId(z.id)}
              onMouseLeave={() => setActiveId(null)}
              onClick={() => setActiveId((cur) => (cur === z.id ? null : z.id))}
            >
              <span className="inv-map-legend-label">{z.label}</span>
              <span className="inv-map-legend-desc">{z.description}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
