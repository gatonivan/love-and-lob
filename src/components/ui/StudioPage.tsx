import { useState, useEffect } from 'react'
import './StudioPage.css'

interface Item { slug: string; name: string; bucket: string }
interface HumanItem { slug: string; name: string | null; bucket: string }
interface ScanResult {
  verdicts: Array<Item & { verdict: string }>
  added: HumanItem[]
  removed: HumanItem[]
  blocked: { guard: string; reason: string } | null
  scanOk: boolean
}

type Status = 'idle' | 'loading' | 'applying' | 'done' | 'error'

const KEY_STORAGE = 'll-studio-key'
const NO_NAME_REMOVED = 'A program no longer listed on Sweatpals'
const NO_NAME_ADDED = 'A new program not yet named on Sweatpals'

async function callStudio(key: string, action: string) {
  const res = await fetch('/api/studio', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-studio-key': key },
    body: JSON.stringify({ action }),
  })
  if (res.status === 401) throw new Error('unauthorized')
  if (!res.ok) throw new Error('failed')
  return res.json()
}

export function StudioPage() {
  const [key, setKey] = useState(() => localStorage.getItem(KEY_STORAGE) || '')
  const [entry, setEntry] = useState('')
  const [scan, setScan] = useState<ScanResult | null>(null)
  const [status, setStatus] = useState<Status>(
    () => (localStorage.getItem(KEY_STORAGE) ? 'loading' : 'idle'),
  )
  const [error, setError] = useState('')

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Studio · Love & Lob'
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.appendChild(meta)
    return () => {
      document.title = previousTitle
      document.head.removeChild(meta)
    }
  }, [])

  // A 401 always means the stored passphrase is no longer good — for scan
  // (on load) and for apply (rotated mid-session) alike — so both routes
  // through this branch, back to the gate, rather than leaving a dead end.
  const handleFailure = (err: unknown, genericMessage: string) => {
    if ((err as Error).message === 'unauthorized') {
      localStorage.removeItem(KEY_STORAGE)
      setKey('')
      setError('That passphrase did not work.')
    } else {
      setError(genericMessage)
    }
    setStatus('error')
  }

  useEffect(() => {
    if (!key) return
    let cancelled = false
    const run = async () => {
      try {
        const data = await callStudio(key, 'scan')
        if (cancelled) return
        setScan(data)
        setStatus('idle')
      } catch (err) {
        if (cancelled) return
        handleFailure(err, 'Could not reach the server. Try again in a minute.')
      }
    }
    void run()
    return () => { cancelled = true }
  }, [key])

  const unlock = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem(KEY_STORAGE, entry)
    setError('')
    setStatus('loading')
    setKey(entry)
  }

  const apply = async () => {
    setStatus('applying')
    try {
      await callStudio(key, 'apply')
      setStatus('done')
    } catch (err) {
      handleFailure(err, 'Could not start the update.')
    }
  }

  if (!key) {
    return (
      <div className="studio-page">
        <form className="studio-gate" onSubmit={unlock}>
          <h1>Studio</h1>
          <input
            type="password" value={entry} autoFocus
            onChange={(e) => setEntry(e.target.value)}
            placeholder="Passphrase" aria-label="Passphrase"
          />
          <button type="submit">Enter</button>
          {error && <p className="studio-error">{error}</p>}
        </form>
      </div>
    )
  }

  const changes = (scan?.added.length ?? 0) + (scan?.removed.length ?? 0)
  const healthy = scan?.verdicts.filter((v) => v.verdict === 'healthy' || v.verdict === 'quiet') ?? []

  return (
    <div className="studio-page">
      <header className="studio-header">
        <h1>Studio</h1>
        <p>Keeps the Schedule page in step with Sweatpals.</p>
      </header>

      {status === 'loading' && <p className="studio-note">Checking Sweatpals…</p>}
      {error && <p className="studio-error">{error}</p>}

      {scan && !scan.scanOk && (
        <p className="studio-error">
          Couldn&apos;t read Sweatpals right now. The site is still showing the last
          known-good list — nothing is broken. Try again later.
        </p>
      )}

      {scan?.blocked && (
        <p className="studio-warn">
          This change is big enough that it needs a human: {scan.blocked.reason}
        </p>
      )}

      {scan && scan.scanOk && (
        <>
          <ul className="studio-list">
            {scan.removed.map((r) => (
              <li key={r.slug} className="studio-item studio-item--out">
                <span aria-hidden="true">✕</span>
                <div><strong>{r.name ?? NO_NAME_REMOVED}</strong><em>Gone from Sweatpals and out of dates</em></div>
              </li>
            ))}
            {scan.added.map((a) => (
              <li key={a.slug} className="studio-item studio-item--in">
                <span aria-hidden="true">+</span>
                <div><strong>{a.name ?? NO_NAME_ADDED}</strong><em>New on Sweatpals</em></div>
              </li>
            ))}
            {changes === 0 && (
              <li className="studio-item studio-item--ok">
                <span aria-hidden="true">✓</span>
                <div><strong>Everything matches</strong><em>{healthy.length} programs healthy</em></div>
              </li>
            )}
          </ul>

          {status === 'done' ? (
            <p className="studio-note">
              Started. The site updates in a couple of minutes — no need to stay on this page.
            </p>
          ) : (
            <button
              className="studio-apply" onClick={apply}
              disabled={changes === 0 || status === 'applying' || !!scan.blocked}
            >
              {status === 'applying' ? 'Starting…' : 'Update the site'}
            </button>
          )}
        </>
      )}
    </div>
  )
}
