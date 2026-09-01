import flyer from '../../../assets/swapmeet/flyer.jpg'

/** One DJ slot on the launch-party bill. */
export interface DjSlot {
  time: string
  name: string
  blurb: string
}

export interface DayCard {
  /** Short weekday + date, e.g. "Thu · Sept 3". */
  when: string
  title: string
  room: string
  /** Door/start time. Always rendered so both cards share a baseline. */
  time: string
  body: string
  /** DJ bill, where the night has one. */
  lineup?: DjSlot[]
}

export interface ExpectItem {
  title: string
  body: string
}

export interface RosterBrand {
  name: string
  /**
   * One verified sentence. Left undefined when the brand could not be
   * identified from a public source — a wordmark beats invented copy.
   */
  blurb?: string
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
    { label: 'Doors', value: 'Thursday 8PM · Friday 2PM' },
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
      time: '8PM to 12AM',
      body: 'Indoor-outdoor rooftop with panoramic skyline views of the Williamsburg Bridge. Signature cocktails, and the whole room opening the weekend together.',
      lineup: [
        {
          time: '8 – 10PM',
          name: 'Doug',
          blurb: 'A regular on the LINK UP bill, most recently opening the series\u2019 Brooklyn rooftop edition alongside FS Green and Black Noi$e.',
        },
        {
          time: '10PM – 12AM',
          name: 'Andre Power',
          blurb: 'Co-founder and creative director of Soulection, and the curator behind LINK UP, the party he has taken from Los Angeles to rooms in more than 25 countries.',
        },
      ],
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
  // Blurbs are sourced from each brand's own site or press coverage. EC and
  // Players NYC could not be identified from any public source and carry no
  // blurb rather than an invented one.
  roster: [
    {
      name: 'Video Game Amateurs',
      blurb: 'The NYC gaming agency behind livestreamed tournaments and in-person festivals, taking its name from am\u0101tor, the Latin for one who loves.',
    },
    {
      name: 'Sigrún',
      blurb: 'New York tennis and racquet apparel named for the valkyrie, built on premium fabrics and ethical production.',
    },
    {
      name: 'Grey Goose',
      blurb: 'The French vodka house, pouring the signature cocktails on the rooftop Thursday night.',
    },
    { name: 'EC' },
    {
      name: 'Bageled NYC',
      blurb: 'Bagel-inspired tennis gear out of New York, named for the 6\u20130 set nobody wants to be handed.',
    },
    {
      name: 'Racquet',
      blurb: 'The quarterly magazine that covers tennis as culture: its art, style, history and ideas.',
    },
    {
      name: 'Vibe Tennis',
      blurb: 'Founded by musician and player Richard Henry, an apparel brand built on the overlap of tennis, art and music.',
    },
    { name: 'Players NYC' },
  ],

  contact: {
    email: 'info@loveandlob.co',
    instagram: '@loveandlobnyc',
    instagramUrl: 'https://instagram.com/loveandlobnyc',
  },
}
