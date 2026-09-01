import { useEffect, useState } from 'react'
import { useSceneStore } from '../../../stores/sceneStore'
import type { Flyer } from './swapMeetData'

const HOLD_MS = 5200

interface FlyerStackProps {
  flyers: Flyer[]
}

/**
 * Crossfades the posters in the hero.
 *
 * WCAG 2.2.2: content that moves on its own for more than five seconds needs a
 * pause mechanism, so the cycle ships with one and never starts at all when the
 * viewer prefers reduced motion — in that case the jump controls are the only
 * way it moves, which is the point.
 */
export function FlyerStack({ flyers }: FlyerStackProps) {
  const reducedMotion = useSceneStore((s) => s.reducedMotion)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)

  const cycling = playing && !reducedMotion && flyers.length > 1

  useEffect(() => {
    if (!cycling) return
    const id = setInterval(() => setIndex((i) => (i + 1) % flyers.length), HOLD_MS)
    return () => clearInterval(id)
  }, [cycling, flyers.length])

  return (
    <div className="sm-flyers">
      <div className="sm-flyer-stack">
        {flyers.map((f, i) => (
          <img
            key={f.image}
            className={`sm-flyer${i === index ? ' sm-flyer--current' : ''}`}
            src={f.image}
            alt={f.alt}
            aria-hidden={i !== index || undefined}
          />
        ))}
      </div>

      <div className="sm-flyer-controls">
        <p className="sm-flyer-label">{flyers[index].label}</p>

        <div className="sm-flyer-buttons">
          <ul className="sm-flyer-dots">
            {flyers.map((f, i) => (
              <li key={f.image}>
                <button
                  type="button"
                  className="sm-flyer-dot"
                  aria-current={i === index}
                  onClick={() => {
                    setIndex(i)
                    setPlaying(false)
                  }}
                >
                  <span className="sm-sr-only">Show the {f.label} poster</span>
                </button>
              </li>
            ))}
          </ul>

          {!reducedMotion && flyers.length > 1 && (
            <button
              type="button"
              className="sm-flyer-toggle"
              aria-pressed={!playing}
              onClick={() => setPlaying((v) => !v)}
            >
              {playing ? 'Pause' : 'Play'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
