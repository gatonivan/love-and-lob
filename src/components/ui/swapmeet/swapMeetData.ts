import flyer from '../../../assets/swapmeet/flyer.jpg'

export interface DayCard {
  /** Short weekday + date, e.g. "Thu · Sept 3". */
  when: string
  title: string
  room: string
  /** Door/start time. Always rendered so both cards share a baseline. */
  time: string
  body: string
}

export interface ExpectItem {
  title: string
  body: string
}

export interface RosterBrand {
  name: string
  /**
   * Imported logo asset. Rendered as a cream knockout on the green page; brands
   * without one fall back to their name set as a wordmark.
   */
  logo?: string
}

/** A label/value pair in the hero's fact list. */
export interface Fact {
  label: string
  value: string
}

export interface SwapMeetData {
  name: string
  lede: string
  eyebrow: string
  dateLabel: string
  facts: Fact[]
  venue: { name: string; address: string; mapUrl: string }
  flyer: { image: string; alt: string }
  intro: string[]
  kicker: string
  days: DayCard[]
  expect: ExpectItem[]
  roster: RosterBrand[]
  contact: { email: string; instagram: string; instagramUrl: string }
}

export const swapMeetData: SwapMeetData = {
  name: 'Love & Lob Swap Meet',
  lede: 'Tennis on court. Culture off it.',
  eyebrow: 'Two days in Williamsburg',
  dateLabel: 'September 3–4, 2026',

  facts: [
    { label: 'When', value: 'Thu Sept 3 to Fri Sept 4, 2026' },
    { label: 'Where', value: 'Moxy Williamsburg, Brooklyn NY 11211' },
    { label: 'Doors', value: 'Friday from 2PM' },
  ],

  venue: {
    name: 'Moxy Williamsburg',
    address: 'Brooklyn, NY 11211',
    mapUrl: 'https://maps.google.com/?q=Moxy+Williamsburg+Brooklyn+NY+11211',
  },

  flyer: {
    image: flyer,
    alt: 'Love & Lob Swap Meet flyer. September 3–4 2026, Moxy Williamsburg, Brooklyn NY 11211, starting at 2PM.',
  },

  // Slide 6 ("The Activation"), reframed from sponsor-facing to attendee-facing.
  intro: [
    'A curated marketplace built for emerging and independent tennis labels to find you directly, without the legacy corporate marketing budget sitting in between.',
    'Two days spotlighting brands making small-run apparel, design-forward equipment, and lifestyle goods, landing in the middle of the biggest tennis week New York gets all year.',
  ],
  kicker: 'A marketplace that rewards design identity and community over mega-budget advertising.',

  days: [
    {
      when: 'Thu · Sept 3',
      title: 'The Launch Party',
      room: 'Lillistar Rooftop',
      time: 'Time to be announced',
      body: 'Indoor-outdoor rooftop with panoramic skyline views of the Williamsburg Bridge. Live DJ sets, signature cocktails, and the whole room opening the weekend together.',
    },
    {
      when: 'Fri · Sept 4',
      title: 'The Marketplace',
      room: 'The Garden / Courtyard',
      time: 'Doors 2PM',
      body: 'The full floor of vendors, browsable end to end. Come through, meet the people making the stuff, and buy straight from them.',
    },
  ],

  // The six activity names off the flyer.
  expect: [
    {
      title: 'Shops',
      body: 'The core of it. Independent labels set up across the courtyard, selling direct.',
    },
    {
      title: 'Embroidery',
      body: 'Live customization on site. Bring a piece or pick one up and get it finished on the spot.',
    },
    {
      title: 'Video games',
      body: 'A gaming corner run by Video Game Amateurs. Pull up, take a controller, talk trash.',
    },
    {
      title: 'Trading cards',
      body: 'Cards out on the tables all day. Browse, buy, trade, and dig for something you have been chasing.',
    },
    {
      title: 'Panel',
      body: 'A live conversation with the people building independent tennis culture in New York right now.',
    },
    {
      title: 'Trivia',
      body: 'Tennis trivia with the room playing along. Knowing the game is the only entry fee.',
    },
  ],

  // Four from deck slide 8's featured roster, four more off the flyer's logo row.
  // Names only until logo files land in src/assets/swapmeet/brands/.
  roster: [
    { name: 'Video Game Amateurs' },
    { name: 'Sigrún' },
    { name: 'Grey Goose' },
    { name: 'EC' },
    { name: 'Bageled NYC' },
    { name: 'Racquet' },
    { name: 'Vibe Tennis' },
    { name: 'Players NYC' },
  ],

  contact: {
    email: 'info@loveandlob.co',
    instagram: '@loveandlobnyc',
    instagramUrl: 'https://instagram.com/loveandlobnyc',
  },
}
