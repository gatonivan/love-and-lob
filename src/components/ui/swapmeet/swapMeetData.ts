import flyerSwapMeet from '../../../assets/swapmeet/flyer.jpg'
import flyerParty from '../../../assets/swapmeet/flyer_party.jpg'
import lillistar from '../../../assets/swapmeet/lillistar.png'

/** One DJ slot on the launch-party bill. */
export interface DjSlot {
  time: string
  name: string
  blurb: string
}

/** One timed entry in Friday's run of show. */
export interface RunItem {
  time: string
  label: string
  note?: string
}

/** Something present all day rather than scheduled. */
export interface ExpectItem {
  title: string
  body: string
}

export interface RosterBrand {
  name: string
  /**
   * Two sourced sentences. Left undefined when the brand could not be
   * identified from a public source — a wordmark beats invented copy.
   */
  blurb?: string
  /** Cream-knockout logo, when we have one. Falls back to the name. */
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
  launchParty: {
    when: string
    title: string
    room: string
    time: string
    body: string[]
    mark: { image: string; alt: string }
    lineup: DjSlot[]
    flyer: { image: string; alt: string }
  }
  marketplace: {
    when: string
    title: string
    room: string
    time: string
    body: string[]
    runOfShow: RunItem[]
  }
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
    { label: 'Hours', value: 'Thu 8PM to 12AM · Fri 2 to 8PM' },
  ],

  venue: {
    name: 'Moxy Williamsburg',
    address: 'Brooklyn, NY 11211',
    mapUrl: 'https://maps.google.com/?q=Moxy+Williamsburg+Brooklyn+NY+11211',
  },

  flyer: {
    image: flyerSwapMeet,
    alt: 'Love & Lob Swap Meet flyer. September 3–4 2026, Moxy Williamsburg, Brooklyn NY 11211, starting at 2PM.',
  },

  // Slide 6 ("The Activation"), reframed from sponsor-facing to attendee-facing.
  intro: [
    'A curated marketplace built for emerging and independent tennis labels to find you directly, without the legacy corporate marketing budget sitting in between.',
    'Two days spotlighting brands making small-run apparel, design-forward equipment, and lifestyle goods, landing in the middle of the biggest tennis week New York gets all year.',
  ],
  kicker: 'A marketplace that rewards design identity and community over mega-budget advertising.',

  launchParty: {
    when: 'Thursday · September 3',
    title: 'The Launch Party',
    room: 'Lillistar Rooftop',
    time: '8PM to 12AM',
    body: [
      'The weekend opens on the Lillistar rooftop. Indoor-outdoor, panoramic skyline views of the Williamsburg Bridge, and signature cocktails poured by Grey Goose.',
      'Two DJs across four hours, and the whole room opening the weekend together before the doors go up on the marketplace.',
    ],
    mark: { image: lillistar, alt: 'Lillistar' },
    lineup: [
      {
        time: '8 – 10PM',
        name: 'Doug',
        blurb: 'A regular on the LINK UP bill, most recently opening the series’ Brooklyn rooftop edition alongside FS Green and Black Noi$e.',
      },
      {
        time: '10PM – 12AM',
        name: 'Andre Power',
        blurb: 'Co-founder and creative director of Soulection, and the curator behind LINK UP, the party he has taken from Los Angeles to rooms in more than 25 countries.',
      },
    ],
    flyer: {
      image: flyerParty,
      alt: 'Love & Lob presents Andre Power and Doug. September 3 2026, 8PM to 12AM at Lillistar.',
    },
  },

  marketplace: {
    when: 'Friday · September 4',
    title: 'The Marketplace',
    room: 'The Garden / Courtyard',
    time: '2PM to 8PM',
    body: [
      'The full floor of vendors, browsable end to end. Come through, meet the people making the stuff, and buy straight from them.',
      'Music all afternoon and drinks poured by Grey Goose, with three things worth showing up on time for.',
    ],
    runOfShow: [
      { time: '2PM', label: 'Doors open' },
      { time: '5PM', label: 'Panel discussion', note: 'Led by Racquet' },
      { time: '7PM', label: 'Tennis trivia', note: '$200 for the winner, plus other prizes' },
      { time: '8PM', label: 'Live guitarist' },
    ],
  },

  // Present all day rather than scheduled — the timed items live in the run of
  // show above, so nothing here should read like a sequence.
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
      title: 'Music and drinks',
      body: 'Music running through the afternoon and a bar poured by Grey Goose, both days.',
    },
  ],

  // Blurbs sourced from each brand's own site or press coverage. EC could not be
  // identified from any public source and carries no blurb rather than a guess.
  roster: [
    {
      name: 'Video Game Amateurs',
      blurb: 'A New York gaming agency blending esports, culture and community, from livestreamed tournaments to in-person festivals. They ran production for the first NYC Video Game Festival and the collegiate circuit spanning 22 schools across the state.',
    },
    {
      name: 'Sigrún',
      blurb: 'A New York racquet-sports label started in 2020 by David Caylor, who came back to tennis after a decade in finance and could not find kit he wanted to wear. Named for the valkyrie, and built to a standard of at least 50% recycled or organic material in every style.',
    },
    {
      name: 'Grey Goose',
      blurb: 'The French vodka house, pouring the signature cocktails on the Lillistar rooftop on Thursday night. They are behind the bar again through Friday afternoon in the courtyard.',
    },
    { name: 'EC' },
    {
      name: 'Bageled NYC',
      blurb: 'A two-man operation from Michael Foronda and Sam Burns, making small runs of bagel-inspired tennis gear since 2022 and worn all over the Fort Greene tennis scene. The name is the scoreline nobody wants handed to them; the house motto is Served Fresh Daily.',
    },
    {
      name: 'Racquet',
      blurb: 'The quarterly that covers tennis as culture: its art, style, history and ideas. Launched in 2016 by Caitlin Thompson and David Shaftel after a Kickstarter raised $55,000, and leading Friday’s panel at 5PM.',
    },
    {
      name: 'Vibe Tennis',
      blurb: 'Founded by Richard Henry, a Barbadian musician and player who represented his country internationally before a scholarship to Jackson State. The brand runs on the overlap of tennis, art and music, with island vibrations throughout.',
    },
    {
      name: 'Players NYC',
      blurb: 'An app for finding a hitting partner at any court in any borough, currently in iOS beta. Their line is simple enough: the city is your court.',
    },
  ],

  contact: {
    email: 'info@loveandlob.co',
    instagram: '@loveandlobnyc',
    instagramUrl: 'https://instagram.com/loveandlobnyc',
  },
}
