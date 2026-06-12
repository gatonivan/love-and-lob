import flyerVol2 from '../../../assets/invitational/flyer_vol2.jpg'
import parkingMap from '../../../assets/invitational/parking_map.png'
import logoUstaEastern from '../../../assets/invitational/sponsors/usta_eastern.png'
import logoHydracourt from '../../../assets/invitational/sponsors/hydracourt.png'
import logoVacation from '../../../assets/invitational/sponsors/vacation.svg'
import logoLmnt from '../../../assets/invitational/sponsors/lmnt.png'
import logoLosecco from '../../../assets/invitational/sponsors/losecco.png'
import logoMezcla from '../../../assets/invitational/sponsors/mezcla.svg'
import logoFlavcity from '../../../assets/invitational/sponsors/flavcity.png'
import logoVitalProteins from '../../../assets/invitational/sponsors/vitalproteins.png'
import logoBarebells from '../../../assets/invitational/sponsors/barebells.png'
import logoIncrediwear from '../../../assets/invitational/sponsors/incrediwear.png'
import logoSecondServe from '../../../assets/invitational/sponsors/secondserve.svg'

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
  blurb?: string
  role?: string
  logo?: string
}

export interface Faq {
  question: string
  /** Each entry renders as its own paragraph. */
  answer: string[]
  /** Optional graphic rendered below the answer (e.g. the parking route map). */
  image?: { src: string; alt: string }
}

export interface DirectionsBlock {
  title: string
  /** Each entry renders as its own paragraph. */
  paragraphs?: string[]
  bullets?: string[]
  link?: { label: string; href: string }
  /** Optional graphic rendered below the block (e.g. the parking route map). */
  image?: { src: string; alt: string }
}

export interface NarrativeBlock {
  title: string
  bullets: string[]
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
  flyer: { image: string; alt: string }
  intro: string[]
  tickets: TicketTier[]
  schedule: ScheduleItem[]
  narrative: { heading: string; lead: string; blocks: NarrativeBlock[] }
  sponsors: Sponsor[]
  faqs: Faq[]
  directions: DirectionsBlock[]
}

const TICKETS_URL =
  'https://sweatpals.com/retreat/ll-invitational-vol-2-w-courtside-theory/2026-06-13/checkout?utm_source=host_e861336b-71dd-4e9b-b2d7-19f6da71f6b1&utm_medium=shared_link&utm_campaign=event_share_f6b241e8-b764-467e-9f3f-95949fec6dfa'

export const invitationalData: InvitationalData = {
  showOnSchedule: true,
  name: 'Love & Lob Invitational Vol. 2',
  feat: 'Courtside Theory',
  scriptLine: 'Tennis at the',
  dateLabel: 'Saturday, June 13, 2026',
  dateBadge: { weekday: 'SAT', month: 'JUNE', day: '13' },
  timeLabel: '12:30 – 6:30 PM',
  venue: { name: 'Atlantic Beach Tennis Center', address: '60 The Plz, Atlantic Beach, NY' },
  flyer: {
    image: flyerVol2,
    alt: 'Love & Lob Invitational Vol. 2 ft. Courtside Theory — Saturday June 13th 2026, Atlantic Beach Tennis Center',
  },
  intro: [
    "It's a day packed with non-stop tennis, food, & refreshing drinks. Whether you decide to hit the courts or simply relax courtside or at the beach, soaking up the sun, there's something for everyone to enjoy.",
    "We'll have 10 courts running all day with dedicated pros leading drills & games, Love & Lob & Courtside Theory style. Come groove with us as we close out the spring season.",
  ],
  tickets: [
    {
      title: 'Tennis Registration',
      status: 'sold-out',
      prices: [],
      includes: [
        '5+ hours of tennis',
        'Lunch provided by Taqueria Ramirez',
        'Access to the beach club',
        'Goodie bag with gifts from Vacation, LMNT, Mezcla & more',
        'Tote bag from Love & Lob',
        'Water bottle by Courtside Theory',
        'Champagne cocktails from Lo Secco Prosecco',
        'Automatic entry into a raffle for special prizes from Wilson, Bageled & more',
      ],
    },
    {
      title: 'Spectator Ticket',
      status: 'available',
      prices: [],
      includes: [
        'Free 1-hour beginner session with USTA Red Ball',
        'Lunch provided by Taqueria Ramirez',
        'Access to the beach club',
        'Champagne cocktails from Lo Secco Prosecco',
        'Automatic entry into a raffle for special prizes',
      ],
      cta: { label: 'Grab a Spectator Ticket', href: TICKETS_URL },
    },
  ],
  schedule: [
    { time: '12:30 PM', label: 'Registration & Welcome' },
    { time: '1:25 PM', label: 'Warmup & Drills' },
    { time: '2:15 PM', label: 'Games Start! Love & Lob vs. Courtside Theory' },
    { time: '4:15 PM', label: 'Lunch Break' },
    { time: '5:00 PM', label: 'Game On, Again!' },
    { time: '6:30 PM', label: 'Tennis Ends — Winners Announced!' },
  ],
  narrative: {
    heading: 'How the Tennis Works',
    lead: "Tennis is slated to start at 1:25 PM. We've divided everyone by skill level for the drills and games.",
    blocks: [
      {
        title: 'Drills',
        bullets: [
          'Court assignments & groups will be sent out Saturday morning via text/email, and listed at the Tennis Center.',
          "We'll warm up all shots from 1:25 PM to 2:00 PM before the games start.",
        ],
      },
      {
        title: 'Games',
        bullets: [
          'Teams will be announced at 2:00 PM.',
          "Games start at 2:15 PM — each coach will explain the game you're playing on their court.",
          '20-minute rotations for each session.',
          'Once a session ends, you move to the next court and play the next game.',
          'Games are mostly team, doubles-based games, with some singles.',
        ],
      },
    ],
  },
  sponsors: [
    {
      name: 'USTA Eastern',
      role: 'Title Sponsor',
      blurb: 'The governing body for tennis in the Northeast, championing access and competition at every level.',
      logo: logoUstaEastern,
    },
    { name: 'HydraCourt', blurb: 'Cutting-edge court hydration technology keeping surfaces play-ready in any condition.', logo: logoHydracourt },
    { name: 'Vacations, Inc.', blurb: 'Premium travel experiences designed for those who bring their racket everywhere they go.', logo: logoVacation },
    { name: 'LMNT', blurb: 'Science-backed electrolyte drink mix built for athletes who train hard and recover harder.', logo: logoLmnt },
    { name: 'Lo Secco Prosecco', blurb: 'A crisp, dry prosecco made for celebrating the moments between the points.', logo: logoLosecco },
    { name: 'Mezcla', blurb: 'Bold, Latin-inspired protein bars crafted for the athlete who moves between cultures and courts.', logo: logoMezcla },
    { name: 'Flav City', blurb: 'Making clean, nutrient-dense eating accessible, delicious, and actually worth talking about.', logo: logoFlavcity },
    { name: 'Wip', blurb: "Next-gen recovery and performance gear engineered for the modern athlete's lifestyle." },
    { name: 'Vital Proteins', blurb: 'Collagen-forward nutrition that fuels performance from the inside out.', logo: logoVitalProteins },
    { name: 'Barebells', blurb: "High-protein bars and shakes that prove healthy snacking doesn't have to taste like a sacrifice.", logo: logoBarebells },
    { name: 'Incrediwear', blurb: 'Circulation-enhancing performance wear that speeds recovery so you can get back on court faster.', logo: logoIncrediwear },
    { name: 'Second Serve Magazine', blurb: 'The culture-first tennis publication redefining what the sport looks, sounds, and feels like.', logo: logoSecondServe },
    { name: 'The Shores', blurb: 'A beachside escape just outside the city where the energy of NYC meets the ease of the shoreline.' },
    { name: 'Broken Strings', blurb: 'The tennis lifestyle brand turning court culture into something you wear, rep, and live off the court.' },
    { name: 'Punto Grips', blurb: 'Premium performance grips engineered for players who demand feel, control, and consistency on every shot.' },
  ],
  faqs: [
    {
      question: 'How do I access the beach?',
      answer: [
        'The beach club opens at 10 AM.',
        'Check in and collect a wristband at the Atlantic Beach Tennis Center to attend Shores West Beach Club. With your ticket, beach access is an additional $10.',
        'Beach chairs and umbrellas are available for $2 and $5, respectively — pay for those at the Beach Club.',
      ],
    },
    {
      question: 'I signed up for a half-day ticket — when do I need to arrive?',
      answer: [
        'If you signed up for a half-day ticket, your planned playing time is the First Half, 1:25 PM to 4:15 PM.',
        'Want to come for the Second Half instead (5:00 PM to 6:30 PM)? Email us ASAP at info@loveandlob.co.',
      ],
    },
    {
      question: 'Does the facility have showers?',
      answer: ['Yes — both the Atlantic Beach Tennis Center and Shores West Beach Club have showers.'],
    },
    {
      question: 'What time does tennis start?',
      answer: ['1:25 PM (First Half) and 5:00 PM (Second Half).'],
    },
    {
      question: 'Where can I park?',
      answer: [
        'In the Club parking lot only — it’s free. Coming off the Atlantic Beach Bridge onto Park Street, make a right onto Albany Blvd, drive down to the following intersection, make a right, then an immediate right into the lot (entrance marked on the facility map above).',
        'Please don’t park anywhere else — there is no street parking without a permit, and the city is strict with ticketing.',
        'The other option is purchasing a $40 parking permit from the Shores West with your wristband.',
      ],
      image: {
        src: parkingMap,
        alt: 'Map of the route to the club parking lot: off the Atlantic Beach Bridge onto Park St, right onto Albany Blvd, then right at Ocean Blvd into the lot',
      },
    },
    {
      question: 'What should I bring?',
      answer: [
        "Tennis sneakers and a cute fit, plus whatever you need for the beach (maybe a towel)! We have racquets for you to use, sunscreen to keep you protected, and everything else.",
      ],
    },
    {
      question: 'How often does the shuttle run?',
      answer: [
        'From Inwood LIRR Station to Atlantic Beach Tennis Center: 10:30 AM · 11:30 AM · 12:30 PM · 1:30 PM · 2:30 PM (last bus).',
        'From Atlantic Beach Tennis Center to Inwood LIRR Station: 4:00 PM · 5:00 PM · 6:00 PM · 7:00 PM · 7:45 PM (last bus).',
      ],
    },
    {
      question: 'Can I play tennis as a spectator?',
      answer: [
        'You can take a free 1-hour beginner lesson from 1:30 PM to 2:30 PM, and play red ball tennis on the pickleball courts as long as you like.',
      ],
    },
    {
      question: 'When will the food be served?',
      answer: ['Lunch from Taqueria Ramirez is served at the 4:15 PM lunch break.'],
    },
    {
      question: "I didn't register. Can I attend?",
      answer: ['Short answer: no — you need a ticket. Spectator tickets are the move while they last.'],
    },
  ],
  directions: [
    {
      title: 'Ferry',
      paragraphs: [
        'For Wall St/Pier 11 and Sunset Park/BAT, there will be departures to and from Rockaway every 25 minutes on summer weekends.',
        'Wall St/Pier 11 to Rockaway: Wall St/Pier 11 → Sunset Park/BAT → Rockaway.',
      ],
      bullets: ['Once you land in Rockaway, bike or Uber to the Atlantic Beach Tennis Center.'],
      link: {
        label: 'Reserve ferry tickets',
        href: 'https://www.ferry.nyc/blog/rockaway-reserve-tickets-available-starting-5-23-2026/',
      },
    },
    {
      title: 'Subway',
      paragraphs: ['Take the A train to the following locations:'],
      bullets: [
        'Take the A to Beach 36th St, then order an Uber (5-minute drive).',
        'Take the A to Far Rockaway, take the LIRR one stop to Inwood, and wait for the shuttle.',
      ],
    },
    {
      title: 'Train / LIRR',
      paragraphs: [
        'Depart from Penn Station, Grand Central, Atlantic Terminal, or any station that arrives at Jamaica/JFK Airport. YOU HAVE TO TRANSFER AT JAMAICA to take the Far Rockaway line to Inwood.',
        'The shuttle bus only runs between Inwood LIRR and Atlantic Beach Tennis Center. Trains run once per hour between Jamaica/JFK and Inwood.',
      ],
      bullets: [
        'Jamaica to Inwood: trains depart on the :58. Please time your commute so you have adequate time to catch the train to Inwood by 10:58, 11:58, etc.',
        'Inwood to Jamaica: trains depart on the :15. The shuttle departs at the top of the hour (3 PM, 4 PM, etc.) every hour until 7:45 PM.',
      ],
    },
    {
      title: 'Car',
      paragraphs: [
        'Address: 60 The Plz, Atlantic Beach, NY 11509.',
        'Want to avoid the Atlantic Beach toll? Change your GPS settings to “avoid tolls”.',
      ],
    },
    {
      title: 'Parking',
      paragraphs: [
        'Club parking lot ONLY — it’s free. Please don’t park anywhere else: no street parking without a permit, and the city is strict with ticketing. A $40 parking permit is also available at the Shores West with your wristband.',
      ],
      image: {
        src: parkingMap,
        alt: 'Map of the route to the club parking lot: off the Atlantic Beach Bridge onto Park St, right onto Albany Blvd, then right at Ocean Blvd into the lot',
      },
    },
  ],
}
