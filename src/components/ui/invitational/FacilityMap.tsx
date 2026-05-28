import { useState } from 'react'

interface FacilityMapProps {
  /** Original illustrated map artwork, kept alongside the interactive recreation. */
  image?: string
  alt: string
}

interface ZoneMeta {
  label: string
  description: string
}

// Labels + descriptions for the interactive spaces. The SVG geometry below is
// keyed by these ids. TODO(content): confirm names/descriptions for the event.
const ZONE_INFO: Record<string, ZoneMeta> = {
  lotA: { label: 'Lot A', description: 'Parking' },
  armstrong: { label: 'Louis Armstrong Stadium', description: 'Secondary show court' },
  lotB: { label: 'Lot B', description: 'Parking' },
  ashe: { label: 'Arthur Ashe Stadium', description: 'Center court & main matches' },
  chase: { label: 'Chase Center', description: 'Indoor courts & lounge' },
  food: { label: 'Food Village', description: 'Food & drinks' },
  grandstand: { label: 'Grandstand', description: 'Lower-bowl show court' },
  courts: { label: 'Match Courts', description: 'Open-play & match courts' },
}

// A "tennis court" rect with a center net + faint baseline.
function Court({ x, y, w = 50, h = 56 }: { x: number; y: number; w?: number; h?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="3" fill="#4f79ab" />
      <line x1={x + w / 2} y1={y + 4} x2={x + w / 2} y2={y + h - 4} stroke="#f1f0e2" strokeWidth="1.4" />
      <line x1={x + 3} y1={y + h / 2} x2={x + w - 3} y2={y + h / 2} stroke="#f1f0e2" strokeWidth="0.8" opacity="0.55" />
    </g>
  )
}

// A simple "portal" gate marker — chamfered tan rectangle with a label below.
function Gate({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g aria-hidden="true" transform={`translate(${x} ${y})`}>
      <rect x="-15" y="-6" width="30" height="12" rx="3" fill="#d9cca8" stroke="#08311e" strokeWidth="1" />
      <line x1="-9" y1="-6" x2="-9" y2="6" stroke="#08311e" strokeWidth="0.9" />
      <line x1="9" y1="-6" x2="9" y2="6" stroke="#08311e" strokeWidth="0.9" />
      <text className="evmap-gate" x="0" y="22">{label}</text>
    </g>
  )
}

export function FacilityMap({ image, alt }: FacilityMapProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const active = activeId ? ZONE_INFO[activeId] : null

  const zoneProps = (id: string) => ({
    className: `evmap-zone${activeId === id ? ' evmap-zone--active' : ''}`,
    role: 'button',
    tabIndex: 0,
    'aria-label': ZONE_INFO[id].label,
    onMouseEnter: () => setActiveId(id),
    onMouseLeave: () => setActiveId(null),
    onClick: () => setActiveId((cur) => (cur === id ? null : id)),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setActiveId((cur) => (cur === id ? null : id))
      }
    },
  })

  return (
    <section className="inv-section">
      <h2 className="inv-h2">Facility Map</h2>

      <svg
        className="evmap-svg"
        viewBox="0 0 1000 560"
        role="img"
        aria-label="Interactive Love & Lob Invitational facility map"
      >
        {/* ── base ground (cream) ──────────────────────────────────────── */}
        <rect x="0" y="0" width="1000" height="560" fill="#efe9da" />

        {/* ── big green field (wraps east + south of the developed area) ─
            Pulled inward to give the developed area real breathing room. */}
        <path
          aria-hidden="true"
          d="
            M 680 0 L 1000 0 L 1000 560 L 0 560 L 0 530
            L 40 528 L 240 530 L 330 522 L 420 504 L 500 478
            L 565 442 L 620 392 L 660 330 L 695 240 L 705 130 L 690 30 Z
          "
          fill="#8aa06e"
        />

        {/* ── roads / cream paths ──────────────────────────────────────── */}
        {/* Main east–west service road behind the stadiums */}
        <path
          aria-hidden="true"
          d="M 195 240 C 320 225, 440 222, 555 235 S 685 260, 720 295"
          stroke="#e3dcc6"
          strokeWidth="20"
          strokeLinecap="round"
          fill="none"
        />
        {/* Path down to the south gate */}
        <path
          aria-hidden="true"
          d="M 380 405 L 380 530"
          stroke="#e3dcc6"
          strokeWidth="16"
          strokeLinecap="round"
          fill="none"
        />

        {/* ── roundabout (lower-right) — simplified to two clean rings ── */}
        <circle aria-hidden="true" cx="730" cy="390" r="42" fill="#e3dcc6" />
        <circle aria-hidden="true" cx="730" cy="390" r="20" fill="#8aa06e" />

        {/* ── interactive zones ─────────────────────────────────────────── */}

        {/* Lot A — top-left parking */}
        <g {...zoneProps('lotA')}>
          <title>{ZONE_INFO.lotA.label}</title>
          <rect className="evmap-fill" x="55" y="50" width="115" height="62" rx="4" fill="#d9cca8" />
          {[0, 1, 2, 3].map((i) => (
            <line
              key={i}
              x1={55 + (i + 1) * 23}
              y1="50"
              x2={55 + (i + 1) * 23}
              y2="112"
              stroke="#b9a987"
              strokeWidth="1.4"
            />
          ))}
          <text className="evmap-label" x="113" y="84">Lot A</text>
        </g>

        {/* Louis Armstrong Stadium — top-center */}
        <g {...zoneProps('armstrong')}>
          <title>{ZONE_INFO.armstrong.label}</title>
          <rect className="evmap-fill" x="325" y="40" width="175" height="165" rx="14" fill="#d9cca8" />
          <rect x="360" y="74" width="105" height="100" rx="4" fill="#4f79ab" />
          <line x1="412.5" y1="74" x2="412.5" y2="174" stroke="#f1f0e2" strokeWidth="1.6" />
          <line x1="360" y1="124" x2="465" y2="124" stroke="#f1f0e2" strokeWidth="0.9" opacity="0.6" />
          <text className="evmap-label" x="412" y="195">Armstrong</text>
        </g>

        {/* Lot B — top-center-right parking */}
        <g {...zoneProps('lotB')}>
          <title>{ZONE_INFO.lotB.label}</title>
          <rect className="evmap-fill" x="540" y="50" width="105" height="60" rx="4" fill="#d9cca8" />
          {[0, 1, 2, 3].map((i) => (
            <line
              key={i}
              x1={540 + (i + 1) * 21}
              y1="50"
              x2={540 + (i + 1) * 21}
              y2="110"
              stroke="#b9a987"
              strokeWidth="1.4"
            />
          ))}
          <text className="evmap-label" x="592" y="84">Lot B</text>
        </g>

        {/* Arthur Ashe Stadium — DOMINANT octagon, center-left */}
        <g {...zoneProps('ashe')}>
          <title>{ZONE_INFO.ashe.label}</title>
          <polygon
            className="evmap-fill"
            points="
              125,170 290,170
              340,225 340,340
              290,395 125,395
              75,340 75,225
            "
            fill="#d9cca8"
          />
          {/* Inset seating ring suggests stepped stadium bowl */}
          <polygon
            aria-hidden="true"
            points="
              140,184 275,184
              325,230 325,335
              275,381 140,381
              90,335 90,230
            "
            fill="none"
            stroke="#b9a987"
            strokeWidth="1.4"
          />
          {/* Court */}
          <rect x="150" y="227" width="115" height="115" rx="4" fill="#4f79ab" />
          <line x1="207.5" y1="227" x2="207.5" y2="342" stroke="#f1f0e2" strokeWidth="1.8" />
          <line x1="150" y1="284" x2="265" y2="284" stroke="#f1f0e2" strokeWidth="1" opacity="0.6" />
          <text className="evmap-label" x="207" y="216">Arthur Ashe</text>
        </g>

        {/* Match Courts — DENSE right-side cluster (3 cols × 4 rows) */}
        <g {...zoneProps('courts')}>
          <title>{ZONE_INFO.courts.label}</title>
          {/* Invisible wrapper rect — gets the lime highlight on hover */}
          <rect
            className="evmap-fill"
            x="772"
            y="70"
            width="200"
            height="280"
            rx="6"
            fill="rgba(255,255,255,0)"
            stroke="transparent"
          />
          {[0, 1, 2, 3].map((r) =>
            [0, 1, 2].map((c) => (
              <Court key={`c-${r}-${c}`} x={784 + c * 62} y={82 + r * 64} w={50} h={54} />
            )),
          )}
          <text className="evmap-label evmap-label--light" x="872" y="62">Match Courts</text>
        </g>

        {/* Chase Center — central angular dark-gray structure */}
        <g {...zoneProps('chase')}>
          <title>{ZONE_INFO.chase.label}</title>
          <polygon
            className="evmap-fill"
            points="455,250 625,240 638,408 442,420"
            fill="#767a6b"
          />
          <text className="evmap-label evmap-label--light" x="540" y="335">Chase Center</text>
        </g>

        {/* Food Village — small clean kiosk between Ashe and Chase */}
        <g {...zoneProps('food')}>
          <title>{ZONE_INFO.food.label}</title>
          <rect className="evmap-fill" x="380" y="242" width="56" height="40" rx="6" fill="#caa46b" />
          <rect x="386" y="248" width="44" height="6" rx="1.5" fill="#f1f0e2" />
          <text className="evmap-label" x="408" y="305">Food</text>
        </g>

        {/* Grandstand — lower-left rounded show court */}
        <g {...zoneProps('grandstand')}>
          <title>{ZONE_INFO.grandstand.label}</title>
          <rect className="evmap-fill" x="60" y="420" width="160" height="95" rx="44" fill="#d9cca8" />
          <rect x="92" y="442" width="95" height="55" rx="4" fill="#4f79ab" />
          <line x1="139.5" y1="442" x2="139.5" y2="497" stroke="#f1f0e2" strokeWidth="1.5" />
          <text className="evmap-label" x="140" y="410">Grandstand</text>
        </g>

        {/* ── gates as portal markers (non-interactive) ────────────────── */}
        <Gate x={175} y={230} label="West Gate" />
        <Gate x={555} y={222} label="East Gate" />
        <Gate x={380} y={510} label="South Gate" />

        {/* ── globe motif (lower-left) — simplified to a single sphere ── */}
        <g aria-hidden="true" transform="translate(75 537)">
          <circle r="16" fill="#4a89c4" />
          <path d="M -10 -3 q 5 -3 10 0 q 5 2 9 -1" fill="none" stroke="#8aa06e" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M -8 5 q 6 -1 11 2" fill="none" stroke="#8aa06e" strokeWidth="2.4" strokeLinecap="round" />
        </g>

        {/* ── compass (lower-center) — single arrow + N ───────────────── */}
        <g aria-hidden="true" transform="translate(290 535)">
          <circle r="12" fill="#efe9da" stroke="#08311e" strokeWidth="1.2" />
          <polygon points="0,-8 -3,3 0,0 3,3" fill="#08311e" />
          <text
            x="0"
            y="-14"
            textAnchor="middle"
            fontSize="9"
            fontFamily="Inter, sans-serif"
            fontWeight="700"
            fill="#08311e"
          >
            N
          </text>
        </g>
      </svg>

      <p className="inv-map-caption">
        {active ? (
          <>
            <strong>{active.label}</strong>
            {active.description ? ` — ${active.description}` : ''}
          </>
        ) : (
          'Tap a space on the map to see what’s there'
        )}
      </p>

      {image && (
        <figure className="inv-map-artwork">
          <figcaption className="inv-map-artwork-label">The full illustrated map</figcaption>
          <img className="inv-map-img" src={image} alt={alt} loading="lazy" />
          <button
            type="button"
            className="inv-map-enlarge"
            onClick={() => window.open(image, '_blank', 'noopener')}
          >
            View full size &rarr;
          </button>
        </figure>
      )}
    </section>
  )
}
