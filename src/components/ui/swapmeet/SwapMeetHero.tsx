import type { SwapMeetData } from './swapMeetData'

interface HeroProps {
  data: Pick<SwapMeetData, 'name' | 'lede' | 'eyebrow' | 'facts' | 'flyer'>
}

/**
 * Asymmetric poster lockup: type left, flyer right. Deliberately not centred —
 * the flyer is the artwork and the copy is the caption, so they get different
 * weights rather than a symmetric stack.
 */
export function SwapMeetHero({ data }: HeroProps) {
  return (
    <section className="sm-hero" aria-labelledby="sm-title">
      <div className="sm-hero-type">
        <p className="sm-eyebrow">{data.eyebrow}</p>
        <h1 className="sm-hero-title" id="sm-title">{data.name}</h1>
        <p className="sm-hero-lede">{data.lede}</p>
        <dl className="sm-facts">
          {data.facts.map((f) => (
            <div key={f.label} className="sm-fact">
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <img className="sm-hero-flyer" src={data.flyer.image} alt={data.flyer.alt} />
    </section>
  )
}
