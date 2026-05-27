import type { Faq } from './invitationalData'

interface FaqListProps {
  faqs: Faq[]
}

export function FaqList({ faqs }: FaqListProps) {
  return (
    <div className="inv-faqs">
      {faqs.map((f) => (
        <details key={f.question} className="inv-faq">
          <summary>{f.question}</summary>
          <p>{f.answer}</p>
        </details>
      ))}
    </div>
  )
}
