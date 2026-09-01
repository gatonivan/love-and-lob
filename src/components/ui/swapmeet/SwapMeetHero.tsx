import type { SwapMeetData } from './swapMeetData'
import { FlyerStack } from './FlyerStack'

interface HeroProps {
  data: Pick<SwapMeetData, 'name' | 'lede' | 'eyebrow' | 'facts' | 'flyers'>
}

/**
 * Asymmetric poster lockup: type left, posters right. Deliberately not centred:
 * the flyers are the artwork and the copy is the caption, so they get different
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
      <FlyerStack flyers={data.flyers} />
    </section>
  )
}
