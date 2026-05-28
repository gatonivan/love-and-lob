import facilityMap from '../../../assets/invitational/facility_map.jpg'

// ── FILL-IN CHECKLIST (real Vol. 2 values) ───────────────────────────────
// [ ] Spectator pricing tiers
// [ ] Tennis + Spectator inclusion lists
// [ ] Schedule times within 12:30–6:30
// [ ] Sponsor list (+ Courtside Theory treatment)
// [ ] FAQ answers
// [ ] Directions / parking for 60 The Plz, Atlantic Beach, NY
// [ ] Final map art + per-zone hotspot coordinates
// ─────────────────────────────────────────────────────────────────────────

export type TicketStatus = 'sold-out' | 'available'

export interface TicketTier {
  title: string
  status: TicketStatus
  prices: string[]
  includes: string[]
  cta?: { label: string; href: string }
}

export interface ScheduleItem {
  time: string
  label: string
}

export interface Sponsor {
  name: string
  logo?: string
}

export interface Faq {
  question: string
  answer: string
}

export interface InvitationalData {
  /** When true, a featured card linking to /invitational appears at the top of
   *  /schedule's Upcoming list. Keep false until the invitational is open/announced. */
  showOnSchedule: boolean
  name: string
  feat?: string
  scriptLine: string
  dateLabel: string
  dateBadge: { weekday: string; month: string; day: string }
  timeLabel: string
  venue: { name?: string; address: string }
  intro: string[]
  tickets: TicketTier[]
  schedule: ScheduleItem[]
  sponsors: Sponsor[]
  faqs: Faq[]
  directions: { byCar?: string; byTrain?: string; parking?: string }
  map: { image?: string; alt: string }
}

export const invitationalData: InvitationalData = {
  showOnSchedule: false, // flip to true to publish the featured card on /schedule
  name: 'Love & Lob Invitational Vol. 2',
  feat: 'Courtside Theory',
  scriptLine: 'Tennis at the',
  dateLabel: 'Saturday, June 13, 2026',
  dateBadge: { weekday: 'SAT', month: 'JUNE', day: '13' },
  timeLabel: '12:30 – 6:30 PM',
  venue: { address: '60 The Plz, Atlantic Beach, NY' },
  intro: [
    // TODO(content): confirm/adjust intro copy for Vol. 2
    "It's a day packed with non-stop tennis, food, & refreshing drinks. Whether you decide to hit the courts or simply relax courtside soaking up the sun, there's something for everyone to enjoy.",
    'We have 8–10 courts running all day with dedicated pros leading drills & games, Love&Lob style. Come groove with us as we close out the spring season.',
  ],
  tickets: [
    {
      title: 'Tennis Registration',
      status: 'sold-out',
      prices: [],
      includes: [
        // TODO(content): confirm Vol. 2 tennis inclusions
        'Full day of tennis',
        'Goodie bag + T-shirt',
        'Light bites',
        'Drinks',
      ],
    },
    {
      title: 'Spectator Ticket',
      status: 'available',
      prices: [
        // TODO(content): real Vol. 2 spectator pricing
        '$XX (Standard)',
        'Free (Kids, 7 & under)',
      ],
      includes: [
        // TODO(content): confirm Vol. 2 spectator inclusions
        'Entrance to the Invitational as a spectator',
        'Light bites',
        'Goodie bag',
        'Drinks',
      ],
      cta: { label: "Let's Eat & Drink!", href: 'https://lu.ma' }, // TODO(content): real ticketing URL (must be an external http(s) link so SubPageWrapper passes it through)
    },
  ],
  schedule: [
    // TODO(content): confirm Vol. 2 schedule within 12:30–6:30
    { time: '12:30 PM', label: 'Registration & Welcome' },
    { time: '1:00 PM', label: 'Non-Stop Tennis Begins' },
    { time: '4:00 PM', label: 'Après-Tennis / Tasting' },
    { time: '6:30 PM', label: "That's all, Folks!" },
  ],
  sponsors: [
    // TODO(content): real Vol. 2 sponsor list
    { name: 'Courtside Theory' },
  ],
  faqs: [
    // TODO(content): real Vol. 2 FAQ answers
    { question: 'Is the event sold out?', answer: 'Tennis registration is sold out. Spectator tickets are still available.' },
    { question: 'What should I bring?', answer: 'TODO(content): bring details.' },
  ],
  directions: {
    // TODO(content): real directions/parking for Atlantic Beach
    byCar: 'TODO(content): driving directions to 60 The Plz, Atlantic Beach, NY.',
    parking: 'TODO(content): parking details.',
  },
  map: {
    // The interactive map is recreated as SVG in FacilityMap.tsx; this image is the
    // original illustrated artwork, kept on the page alongside the interactive version.
    image: facilityMap,
    alt: 'Love & Lob Invitational illustrated facility map',
  },
}
