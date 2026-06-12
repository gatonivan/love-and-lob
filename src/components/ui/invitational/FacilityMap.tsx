import { useState } from 'react'

interface ZoneMeta {
  label: string
  description: string
}

// Labels + descriptions for the interactive spaces. The SVG geometry below is
// keyed by these ids. Descriptions double as quick event facts (pricing, times).
const ZONE_INFO: Record<string, ZoneMeta> = {
  parking: { label: 'Free Parking Lot', description: 'Free for the day — enter from The Plaza. No street parking without a permit!' },
  shuttle: { label: 'Shuttle Stop', description: 'Runs to/from Inwood LIRR — last bus back is 7:45 PM (full schedule in the FAQ)' },
  clubhouse: { label: 'Check-In & Clubhouse', description: 'Registration, wristbands for beach access & showers' },
  courtsWest: { label: 'Courts 1–6', description: 'Clay courts — drills, games & 20-minute rotations all day' },
  courtsEast: { label: 'Courts 7–10', description: 'More clay courts — same games, same energy' },
  pickleball: { label: 'Red Ball Zone', description: 'Pickleball courts — free beginner session for spectators, 1:30–2:30 PM' },
  food: { label: 'Lunch Garden', description: 'Taqueria Ramirez at the 4:15 PM break + Lo Seco champagne cocktails' },
  beachclub: { label: 'Shores West Beach Club', description: 'Wristband + $10 to enter · chairs $2 · umbrellas $5 · showers here too' },
  beach: { label: 'The Beach', description: 'Opens 10 AM — bring a towel!' },
}

// A clay "tennis court" rect with a center net + faint service line.
function Court({ x, y, w = 120, h = 56 }: { x: number; y: number; w?: number; h?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="3" fill="#c0714b" />
      <rect x={x + 6} y={y + 5} width={w - 12} height={h - 10} fill="none" stroke="#f1f0e2" strokeWidth="1.1" opacity="0.8" />
      <line x1={x + w / 2} y1={y + 2} x2={x + w / 2} y2={y + h - 2} stroke="#f1f0e2" strokeWidth="1.6" />
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

// Beach umbrella motif (flyer-style).
function Umbrella({ x, y }: { x: number; y: number }) {
  return (
    <g aria-hidden="true" transform={`translate(${x} ${y})`}>
      <line x1="0" y1="0" x2="0" y2="14" stroke="#08311e" strokeWidth="1.4" />
      <path d="M -13 0 A 13 13 0 0 1 13 0 Z" fill="#e0633c" />
      <path d="M -13 0 A 13 13 0 0 1 -4.5 -12.3 L -4.5 0 Z" fill="#f0c869" />
      <path d="M 4.5 -12.3 A 13 13 0 0 1 13 0 L 4.5 0 Z" fill="#f0c869" />
    </g>
  )
}

// Five-petal flower motif (echoes the flyer's florals).
function Flower({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g aria-hidden="true" transform={`translate(${x} ${y}) scale(${scale})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy="-9" rx="5.5" ry="9" fill="#8d93b4" transform={`rotate(${a})`} />
      ))}
      <circle r="4.5" fill="#e8a23c" />
    </g>
  )
}

export function FacilityMap() {
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
        viewBox="0 0 1000 640"
        role="img"
        aria-label="Interactive map of the Atlantic Beach Tennis Center and Shores West Beach Club"
      >
        {/* ── base ground (warm paper) ─────────────────────────────────── */}
        <rect x="0" y="0" width="1000" height="640" fill="#e8decb" />

        {/* ── lawn — the main facility grounds between road and sand ───── */}
        <path
          aria-hidden="true"
          d="M 0 56 L 1000 56 L 1000 470 Q 760 502 500 496 Q 240 490 0 478 Z"
          fill="#94a878"
        />

        {/* ── The Plaza — road along the top ───────────────────────────── */}
        <rect aria-hidden="true" x="0" y="14" width="1000" height="32" fill="#ded3bc" />
        <line aria-hidden="true" x1="12" y1="30" x2="988" y2="30" stroke="#c5b896" strokeWidth="2" strokeDasharray="14 12" />
        <text className="evmap-road" x="500" y="35">The Plaza</text>

        {/* ── sun (top-right, flyer motif) ─────────────────────────────── */}
        <g aria-hidden="true">
          <circle cx="942" cy="34" r="20" fill="#e0633c" />
          <circle cx="942" cy="34" r="12" fill="none" stroke="#c14f2e" strokeWidth="2.4" />
        </g>

        {/* ── sand + ocean (south edge — the whole point of Atlantic Beach) */}
        <path
          aria-hidden="true"
          d="M 0 478 Q 240 490 500 496 Q 760 502 1000 470 L 1000 575 L 0 575 Z"
          fill="#e6d7ae"
        />
        <rect aria-hidden="true" x="0" y="568" width="1000" height="72" fill="#79aec8" />
        {[584, 602, 620].map((y, i) => (
          <path
            key={y}
            aria-hidden="true"
            d={`M ${i % 2 === 0 ? 20 : 60} ${y} q 30 -8 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0`}
            fill="none"
            stroke="#f1f0e2"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.65"
          />
        ))}

        {/* ── paths: gate to clubhouse, boardwalk down to the beach club ─ */}
        <path aria-hidden="true" d="M 350 46 L 350 92" stroke="#ded3bc" strokeWidth="16" strokeLinecap="round" fill="none" />
        <path aria-hidden="true" d="M 488 170 L 488 500" stroke="#ded3bc" strokeWidth="14" strokeLinecap="round" fill="none" />
        <path aria-hidden="true" d="M 488 500 L 600 522" stroke="#e0d3ae" strokeWidth="12" strokeLinecap="round" fill="none" />

        {/* ── interactive zones ─────────────────────────────────────────── */}

        {/* Free parking lot — top-left, off The Plaza */}
        <g {...zoneProps('parking')}>
          <title>{ZONE_INFO.parking.label}</title>
          <rect className="evmap-fill" x="42" y="70" width="190" height="92" rx="5" fill="#d9cca8" />
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={i} x1={42 + (i + 1) * 31.5} y1="70" x2={42 + (i + 1) * 31.5} y2="162" stroke="#b9a987" strokeWidth="1.4" />
          ))}
          <text className="evmap-icon" x="137" y="124">P</text>
          <text className="evmap-label" x="137" y="180">Free Parking</text>
        </g>

        {/* Shuttle stop — little bus by the lot exit */}
        <g {...zoneProps('shuttle')}>
          <title>{ZONE_INFO.shuttle.label}</title>
          <rect className="evmap-fill" x="252" y="98" width="46" height="24" rx="5" fill="#e8a23c" />
          <rect x="258" y="103" width="10" height="8" rx="1.5" fill="#f1f0e2" />
          <rect x="272" y="103" width="10" height="8" rx="1.5" fill="#f1f0e2" />
          <circle cx="263" cy="124" r="4" fill="#08311e" />
          <circle cx="287" cy="124" r="4" fill="#08311e" />
          <text className="evmap-label" x="275" y="148">Shuttle</text>
        </g>

        {/* Clubhouse / check-in — tan building with a roof ridge */}
        <g {...zoneProps('clubhouse')}>
          <title>{ZONE_INFO.clubhouse.label}</title>
          <rect className="evmap-fill" x="318" y="86" width="150" height="78" rx="6" fill="#d9cca8" stroke="#08311e" strokeWidth="1.2" />
          <path d="M 318 110 L 468 110" stroke="#08311e" strokeWidth="1" opacity="0.5" fill="none" />
          <rect x="382" y="132" width="22" height="32" rx="2" fill="#08311e" opacity="0.65" />
          <text className="evmap-house" x="393" y="103">Check-In</text>
          <text className="evmap-label" x="393" y="184">Clubhouse</text>
        </g>

        {/* Pickleball / Red Ball Zone — top-right trio of small courts */}
        <g {...zoneProps('pickleball')}>
          <title>{ZONE_INFO.pickleball.label}</title>
          <rect className="evmap-fill" x="788" y="72" width="180" height="96" rx="6" fill="#86b5a1" />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x={800 + i * 54} y="84" width="42" height="72" rx="3" fill="#4f79ab" />
              <line x1={800 + i * 54} y1="120" x2={842 + i * 54} y2="120" stroke="#f1f0e2" strokeWidth="1.4" />
            </g>
          ))}
          <text className="evmap-label" x="878" y="188">Red Ball Zone</text>
        </g>

        {/* Courts 1–6 — west clay cluster (3 × 2) */}
        <g {...zoneProps('courtsWest')}>
          <title>{ZONE_INFO.courtsWest.label}</title>
          <rect className="evmap-fill" x="48" y="218" width="412" height="170" rx="8" fill="#b06642" />
          {[0, 1].map((r) =>
            [0, 1, 2].map((c) => (
              <Court key={`w-${r}-${c}`} x={58 + c * 132} y={228 + r * 78} w={122} h={70} />
            )),
          )}
          <text className="evmap-label evmap-label--light" x="254" y="208">Courts 1–6</text>
        </g>

        {/* Courts 7–10 — east clay cluster (2 × 2) */}
        <g {...zoneProps('courtsEast')}>
          <title>{ZONE_INFO.courtsEast.label}</title>
          <rect className="evmap-fill" x="528" y="218" width="280" height="170" rx="8" fill="#b06642" />
          {[0, 1].map((r) =>
            [0, 1].map((c) => (
              <Court key={`e-${r}-${c}`} x={538 + c * 132} y={228 + r * 78} w={122} h={70} />
            )),
          )}
          <text className="evmap-label evmap-label--light" x="668" y="208">Courts 7–10</text>
        </g>

        {/* Lunch garden — kiosk + umbrellas, east of the courts */}
        <g {...zoneProps('food')}>
          <title>{ZONE_INFO.food.label}</title>
          <rect className="evmap-fill" x="838" y="226" width="130" height="150" rx="10" fill="#a3b585" />
          <rect x="858" y="240" width="56" height="34" rx="4" fill="#caa46b" stroke="#08311e" strokeWidth="1" />
          <rect x="864" y="246" width="44" height="6" rx="1.5" fill="#f1f0e2" />
          <Umbrella x={870} y={304} />
          <Umbrella x={930} y={290} />
          <Umbrella x={902} y={342} />
          <text className="evmap-label" x="903" y="396">Lunch Garden</text>
        </g>

        {/* Shores West Beach Club — striped cabana building on the sand */}
        <g {...zoneProps('beachclub')}>
          <title>{ZONE_INFO.beachclub.label}</title>
          <rect className="evmap-fill" x="592" y="498" width="200" height="58" rx="7" fill="#d9cca8" stroke="#08311e" strokeWidth="1.2" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={600 + i * 31} y="498" width="15" height="14" fill="#e0633c" opacity="0.85" />
          ))}
          <rect x="678" y="528" width="20" height="28" rx="2" fill="#08311e" opacity="0.65" />
          <text className="evmap-label" x="692" y="488">Shores West</text>
        </g>

        {/* The beach — sandy strip (umbrellas + towels) */}
        <g {...zoneProps('beach')}>
          <title>{ZONE_INFO.beach.label}</title>
          <rect className="evmap-fill" x="40" y="496" width="500" height="66" rx="10" fill="rgba(255,255,255,0)" stroke="transparent" />
          <Umbrella x={120} y={520} />
          <Umbrella x={250} y={534} />
          <Umbrella x={400} y={518} />
          <rect x="160" y="540" width="26" height="12" rx="2" fill="#d8e84d" opacity="0.9" />
          <rect x="320" y="546" width="26" height="12" rx="2" fill="#e0633c" opacity="0.9" />
          <text className="evmap-label" x="290" y="585">The Beach</text>
        </g>

        {/* ── gates ─────────────────────────────────────────────────────── */}
        <Gate x={350} y={58} label="Main Gate" />
        <Gate x={488} y={478} label="Boardwalk" />

        {/* ── flowers (flyer florals, corners) ─────────────────────────── */}
        <Flower x={30} y={452} />
        <Flower x={62} y={470} scale={0.7} />
        <Flower x={968} y={444} scale={0.85} />

        {/* ── compass (bottom-left, on the water) ──────────────────────── */}
        <g aria-hidden="true" transform="translate(950 606)">
          <circle r="13" fill="#e8decb" stroke="#08311e" strokeWidth="1.2" />
          <polygon points="0,-8.5 -3,3 0,0 3,3" fill="#08311e" />
          <text x="0" y="-17" textAnchor="middle" fontSize="10" fontFamily="Inter, sans-serif" fontWeight="700" fill="#f1f0e2">
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
    </section>
  )
}
