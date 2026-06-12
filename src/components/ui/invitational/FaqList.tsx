import type { Faq } from './invitationalData'

interface FaqListProps {
  faqs: Faq[]
}

const EMAIL = 'info@loveandlob.co'

// Render a paragraph, turning the contact email into a mailto link.
function withEmailLink(text: string) {
  if (!text.includes(EMAIL)) return text
  const [before, after] = text.split(EMAIL)
  return (
    <>
      {before}
      <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
      {after}
    </>
  )
}

export function FaqList({ faqs }: FaqListProps) {
  return (
    <div className="inv-faqs">
      {faqs.map((f) => (
        <details key={f.question} className="inv-faq">
          <summary>{f.question}</summary>
          {f.answer.map((p) => (
            <p key={p}>{withEmailLink(p)}</p>
          ))}
          {f.image && <img className="inv-parking-map" src={f.image.src} alt={f.image.alt} loading="lazy" />}
        </details>
      ))}
    </div>
  )
}
