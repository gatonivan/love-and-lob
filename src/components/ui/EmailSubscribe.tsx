import { useState, useEffect } from 'react'
import { useLocation } from 'react-router'
import './EmailSubscribe.css'

const DISMISS_KEY = 'lnl-email-dismissed'
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function wasDismissedRecently(): boolean {
  const ts = localStorage.getItem(DISMISS_KEY)
  if (!ts) return false
  return Date.now() - Number(ts) < DISMISS_DURATION_MS
}

export function EmailSubscribe() {
  const pathname = useLocation().pathname
  const isHome = pathname === '/'
  const shouldShow = !isHome && !wasDismissedRecently()
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!shouldShow) return
    const timer = setTimeout(() => setVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [shouldShow])

  function dismiss() {
    setVisible(false)
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    // TODO: wire to actual email service (Substack, Mailchimp, etc.)
    setSubmitted(true)
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setTimeout(() => setVisible(false), 2000)
  }

  if (!shouldShow && !visible) return null

  return (
    <div className={`email-subscribe ${visible ? 'email-subscribe--visible' : ''}`}>
      <button className="email-subscribe-close" onClick={dismiss} aria-label="Close">
        &times;
      </button>

      {submitted ? (
        <p className="email-subscribe-thanks">Thanks for subscribing.</p>
      ) : (
        <>
          <p className="email-subscribe-heading">Stay in the loop</p>
          <p className="email-subscribe-copy">
            Get updates on clinics, events, and drops.
          </p>
          <form className="email-subscribe-form" onSubmit={handleSubmit}>
            <input
              type="email"
              className="email-subscribe-input"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="email-subscribe-btn">
              Subscribe
            </button>
          </form>
        </>
      )}
    </div>
  )
}
