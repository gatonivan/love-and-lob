import { useState } from 'react'

interface ZoneMeta {
  label: string
  description: string
}

// Labels + descriptions for the interactive spaces. Geometry below follows the
// real facility diagram: parking strip west, entrance/clubhouse east, stadium
// court center, courts in rows 7–9 / 4–6 / 1–3, pickleball south.
const ZONE_INFO: Record<string, ZoneMeta> = {
  parking: { label: 'Club Parking Lot', description: 'The ONLY place to park — and it’s free. Right onto Albany Blvd, right at the next intersection, then an immediate right into the lot.' },
  dropoff: { label: 'Drop-Off Zone', description: 'Do not park here — drop-off & pick-up only, right by the entrance.' },
  clubhouse: { label: 'Entrance / Clubhouse', description: 'Check-in & registration, wristbands for beach access, showers.' },
  shuttle: { label: 'Shuttle Stop', description: 'To/from Inwood LIRR — last bus back is 7:45 PM (full schedule in the FAQ).' },
  courts79: { label: 'Courts 7–9', description: 'Clay courts — court assignments land Saturday morning via text/email.' },
  courts46: { label: 'Courts 4–6', description: 'Clay courts — 20-minute rotations, then you move to the next court.' },
  courts13: { label: 'Courts 1–3', description: 'Clay courts — closest to the pickleball courts.' },
  stadium: { label: 'Stadium Court', description: 'Center stage for Love & Lob vs. Courtside Theory — grab a spot in the stadium seating.' },
  grill: { label: 'Grill Area', description: 'Lunch by Taqueria Ramirez at the 4:15 PM break + Lo Secco champagne cocktails.' },
  pickleball: { label: 'Pickleball Courts', description: 'Red Ball Zone — free spectator beginner session 1:30–2:30 PM, then play as long as you like.' },
  beach: { label: 'Shores West & The Beach', description: 'Head south of the courts — wristband + $10 to enter, chairs $2, umbrellas $5. Opens 10 AM.' },
}

// Portrait clay court with an optional number badge below (matches the real
// court numbering — assignments go out Saturday morning).
function ClayCourt({ x, y, w = 82, h = 104, num }: { x: number; y: number; w?: number; h?: number; num?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="3" fill="#c0714b" />
      <rect x={x + 5} y={y + 6} width={w - 10} height={h - 12} fill="none" stroke="#f1f0e2" strokeWidth="1.1" opacity="0.8" />
      <line x1={x + 2} y1={y + h / 2} x2={x + w - 2} y2={y + h / 2} stroke="#f1f0e2" strokeWidth="1.6" />
      {num !== undefined && (
        <g aria-hidden="true">
          <circle cx={x + w / 2} cy={y + h + 15} r="10.5" fill="#08311e" stroke="#e8decb" strokeWidth="2" />
          <text className="evmap-num" x={x + w / 2} y={y + h + 15}>{num}</text>
        </g>
      )}
    </g>
  )
}

// Red arrow marker (the diagram's "this way" arrows).
function Arrow({ x, y, rotate = 0 }: { x: number; y: number; rotate?: number }) {
  return (
    <polygon
      aria-hidden="true"
      transform={`translate(${x} ${y}) rotate(${rotate})`}
      points="-9,-18 9,-18 9,-4 17,-4 0,14 -17,-4 -9,-4"
      fill="#e0633c"
    />
  )
}

// Grill cart motif for the grill area.
function GrillCart({ x, y, rotate = 0 }: { x: number; y: number; rotate?: number }) {
  return (
    <g aria-hidden="true" transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <rect x="-17" y="-11" width="34" height="22" rx="3" fill="#4a4a44" />
      <line x1="-11" y1="-11" x2="-11" y2="11" stroke="#f1f0e2" strokeWidth="1" opacity="0.6" />
      <line x1="0" y1="-11" x2="0" y2="11" stroke="#f1f0e2" strokeWidth="1" opacity="0.6" />
      <line x1="11" y1="-11" x2="11" y2="11" stroke="#f1f0e2" strokeWidth="1" opacity="0.6" />
      <circle cx="-10" cy="15" r="3.5" fill="#08311e" />
      <circle cx="10" cy="15" r="3.5" fill="#08311e" />
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

  const courtCols = [300, 412, 524]

  return (
    <section className="inv-section">
      <h2 className="inv-h2">Facility Map</h2>

      <svg
        className="evmap-svg"
        viewBox="0 0 1000 940"
        role="img"
        aria-label="Interactive map of the Atlantic Beach Tennis Center — parking, courts 1 through 9, stadium court, grill area, pickleball courts and clubhouse"
      >
        {/* ── base ground (warm paper) ─────────────────────────────────── */}
        <rect x="0" y="0" width="1000" height="940" fill="#e8decb" />

        {/* ── lawn — the facility grounds ──────────────────────────────── */}
        <rect aria-hidden="true" x="28" y="70" width="944" height="806" rx="18" fill="#94a878" />

        {/* ── sand + water along the south edge (beach is that way) ────── */}
        <rect aria-hidden="true" x="0" y="884" width="1000" height="56" fill="#e6d7ae" />
        <path
          aria-hidden="true"
          d="M 20 926 q 30 -7 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0"
          fill="none"
          stroke="#79aec8"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* ── sun (flyer motif) ────────────────────────────────────────── */}
        <g aria-hidden="true">
          <circle cx="688" cy="38" r="19" fill="#e0633c" />
          <circle cx="688" cy="38" r="11" fill="none" stroke="#c14f2e" strokeWidth="2.2" />
        </g>

        {/* ── walking path: parking → courts → clubhouse (blue, dashed) ── */}
        <path
          aria-hidden="true"
          d="M 190 392 L 612 392 C 660 392, 672 440, 720 446 L 758 448"
          fill="none"
          stroke="#4f79ab"
          strokeWidth="4"
          strokeDasharray="9 8"
          strokeLinecap="round"
          opacity="0.85"
        />
        <text className="evmap-walk" x="216" y="380">walking path</text>

        {/* ── walking paths flanking the courts (solid blue, per club diagram):
              verticals down both sides of courts 7–9 / 4–6, crossbar through
              the 7–9 number badges, all joining the dashed path below ──────── */}
        <g aria-hidden="true" fill="none" stroke="#5b9fd4" strokeWidth="5.5" strokeDasharray="9 8" strokeLinecap="round" opacity="0.9">
          <path d="M 272 116 L 272 388" />
          <path d="M 634 116 L 634 390" />
          <path d="M 272 235 L 634 235" />
        </g>

        {/* ── interactive zones ─────────────────────────────────────────── */}

        {/* Club parking lot — west strip, THE place to park (spotlit) */}
        <g {...zoneProps('parking')}>
          <title>{ZONE_INFO.parking.label}</title>
          <rect className="evmap-fill" x="64" y="130" width="118" height="540" rx="6" fill="#d9cca8" />
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <line key={i} x1="64" y1={130 + i * 54} x2="182" y2={130 + i * 54} stroke="#b9a987" strokeWidth="1.4" />
          ))}
          <rect aria-hidden="true" x="57" y="123" width="132" height="554" rx="9" fill="none" className="evmap-spotlight" />
          <text className="evmap-icon" x="123" y="403">P</text>
          <text className="evmap-house" x="123" y="694">Free Parking</text>
          <text className="evmap-label" x="123" y="718">Club Lot Only!</text>
        </g>
        <Arrow x={123} y={92} />
        <text className="evmap-gate" x="123" y="66">Lot Entrance</text>

        {/* Courts 7–9 — top row */}
        <g {...zoneProps('courts79')}>
          <title>{ZONE_INFO.courts79.label}</title>
          <rect className="evmap-fill" x="288" y="104" width="330" height="158" rx="8" fill="rgba(255,255,255,0)" stroke="transparent" />
          {courtCols.map((cx, i) => (
            <ClayCourt key={`c79-${i}`} x={cx} y={116} num={7 + i} />
          ))}
          <text className="evmap-label" x="453" y="98">Courts 7–9</text>
        </g>

        {/* Courts 4–6 — second row */}
        <g {...zoneProps('courts46')}>
          <title>{ZONE_INFO.courts46.label}</title>
          <rect className="evmap-fill" x="288" y="246" width="330" height="158" rx="8" fill="rgba(255,255,255,0)" stroke="transparent" />
          {courtCols.map((cx, i) => (
            <ClayCourt key={`c46-${i}`} x={cx} y={256} num={4 + i} />
          ))}
        </g>

        {/* Grill area — red-outlined, west of stadium court */}
        <g {...zoneProps('grill')}>
          <title>{ZONE_INFO.grill.label}</title>
          <path
            className="evmap-fill"
            d="M 252 426 Q 248 414 264 412 L 366 408 Q 382 408 380 424 L 384 528 Q 386 542 370 542 L 264 546 Q 250 548 252 532 Z"
            fill="#d9cca8"
            stroke="#e0633c"
            strokeWidth="2.5"
          />
          <GrillCart x={296} y={446} rotate={-8} />
          <GrillCart x={332} y={502} rotate={6} />
          <text className="evmap-house" x="318" y="568">Grill Area</text>
        </g>

        {/* Stadium Court — center stage, with stadium seating on the east side */}
        <g {...zoneProps('stadium')}>
          <title>{ZONE_INFO.stadium.label}</title>
          <rect className="evmap-fill" x="412" y="402" width="132" height="150" rx="10" fill="#b06642" />
          <ClayCourt x={430} y={414} w={96} h={126} />
          <text className="evmap-house" x="478" y="568">Stadium Court</text>
          <g aria-hidden="true">
            <rect x="552" y="408" width="54" height="138" rx="5" fill="#d9cca8" />
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={558 + i * 12} y="415" width="7" height="124" rx="2.5" fill="#4a4a44" opacity={0.85 - i * 0.12} />
            ))}
          </g>
          <text className="evmap-house" x="579" y="562">Seating</text>
        </g>

        {/* Courts 1–3 — lower row (numbered 3·2·1 left to right, like the lot) */}
        <g {...zoneProps('courts13')}>
          <title>{ZONE_INFO.courts13.label}</title>
          <rect className="evmap-fill" x="288" y="574" width="330" height="158" rx="8" fill="rgba(255,255,255,0)" stroke="transparent" />
          {courtCols.map((cx, i) => (
            <ClayCourt key={`c13-${i}`} x={cx} y={584} num={3 - i} />
          ))}
        </g>

        {/* Pickleball courts — directly south of courts 1–3, the Red Ball Zone */}
        <g {...zoneProps('pickleball')}>
          <title>{ZONE_INFO.pickleball.label}</title>
          <text className="evmap-house" x="453" y="752">Pickleball Courts</text>
          <rect className="evmap-fill" x="288" y="760" width="330" height="108" rx="10" fill="#86b5a1" />
          {[0, 1, 2].map((c) =>
            [0, 1].map((r) => (
              <g key={`p-${c}-${r}`}>
                <rect x={304 + c * 98} y={770 + r * 46} width="70" height="40" rx="3" fill="#4f79ab" />
                <line x1={339 + c * 98} y1={770 + r * 46} x2={339 + c * 98} y2={810 + r * 46} stroke="#f1f0e2" strokeWidth="1.3" />
              </g>
            )),
          )}
        </g>

        {/* Drop-off zone — by the entrance, do not park */}
        <g {...zoneProps('dropoff')}>
          <title>{ZONE_INFO.dropoff.label}</title>
          <rect className="evmap-fill" x="762" y="110" width="180" height="128" rx="6" fill="#cfc8b8" />
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={796 + i * 34} y1="234" x2={830 + i * 34} y2="114" stroke="#bdb6a4" strokeWidth="9" />
          ))}
          {[
            { y: 122, fill: '#d97aa6' },
            { y: 160, fill: '#6f9fd8' },
            { y: 198, fill: '#f1f0e2' },
          ].map((car) => (
            <g key={car.y} aria-hidden="true">
              <rect x="772" y={car.y} width="40" height="22" rx="6" fill={car.fill} stroke="#08311e" strokeWidth="1" />
              <rect x="782" y={car.y + 5} width="14" height="12" rx="2" fill="#08311e" opacity="0.55" />
            </g>
          ))}
          <text className="evmap-house" x="852" y="256">Drop-Off Only</text>
        </g>

        {/* Shuttle stop — drops you at the entrance */}
        <g {...zoneProps('shuttle')}>
          <title>{ZONE_INFO.shuttle.label}</title>
          <rect className="evmap-fill" x="790" y="288" width="46" height="24" rx="5" fill="#e8a23c" />
          <rect x="796" y="293" width="10" height="8" rx="1.5" fill="#f1f0e2" />
          <rect x="810" y="293" width="10" height="8" rx="1.5" fill="#f1f0e2" />
          <circle cx="801" cy="314" r="4" fill="#08311e" />
          <circle cx="825" cy="314" r="4" fill="#08311e" />
          <text className="evmap-house" x="884" y="304">Shuttle</text>
        </g>

        {/* Entrance / clubhouse — east side */}
        <g {...zoneProps('clubhouse')}>
          <title>{ZONE_INFO.clubhouse.label}</title>
          <rect className="evmap-fill" x="762" y="372" width="180" height="150" rx="8" fill="#d9cca8" stroke="#08311e" strokeWidth="1.2" />
          <path d="M 762 400 L 942 400" stroke="#08311e" strokeWidth="1" opacity="0.5" fill="none" />
          <rect x="766" y="432" width="14" height="36" rx="2" fill="#08311e" opacity="0.65" />
          <text className="evmap-house" x="852" y="390">Check-In</text>
          <text className="evmap-house" x="856" y="462">Clubhouse</text>
        </g>
        <Arrow x={966} y={440} rotate={90} />
        <text className="evmap-gate" x="964" y="478">Entrance</text>

        {/* Beach pointer — south past the courts */}
        <g {...zoneProps('beach')}>
          <title>{ZONE_INFO.beach.label}</title>
          <rect className="evmap-fill" x="290" y="886" width="420" height="50" rx="8" fill="rgba(255,255,255,0)" stroke="transparent" />
          <text className="evmap-beach" x="500" y="916">↓ To Shores West &amp; The Beach</text>
        </g>

        {/* ── flowers (flyer florals) ──────────────────────────────────── */}
        <Flower x={150} y={806} />
        <Flower x={186} y={830} scale={0.7} />
        <Flower x={820} y={668} scale={0.85} />

        {/* ── compass ──────────────────────────────────────────────────── */}
        <g aria-hidden="true" transform="translate(948 96)">
          <circle r="13" fill="#e8decb" stroke="#08311e" strokeWidth="1.2" />
          <polygon points="0,-8.5 -3,3 0,0 3,3" fill="#08311e" />
          <text x="0" y="-17" textAnchor="middle" fontSize="10" fontFamily="Inter, sans-serif" fontWeight="700" fill="#08311e">
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
