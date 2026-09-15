import { useState, useEffect, useCallback } from 'react'
import './StudioPage.css'

interface Item { slug: string; name: string; bucket: string }
interface ScanResult {
  verdicts: Array<Item & { verdict: string }>
  added: Item[]
  removed: Item[]
  blocked: { guard: string; reason: string } | null
  scanOk: boolean
}

const KEY_STORAGE = 'll-studio-key'

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
  const [status, setStatus] = useState<'idle' | 'loading' | 'applying' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Studio · Love & Lob'
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.appendChild(meta)
    return () => { document.head.removeChild(meta) }
  }, [])

  const runScan = useCallback(async (k: string) => {
    setStatus('loading'); setError('')
    try {
      setScan(await callStudio(k, 'scan'))
      setStatus('idle')
    } catch (err) {
      if ((err as Error).message === 'unauthorized') {
        localStorage.removeItem(KEY_STORAGE); setKey(''); setError('That passphrase did not work.')
      } else {
        setError('Could not reach the server. Try again in a minute.')
      }
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    if (!key) return
    queueMicrotask(() => runScan(key))
  }, [key, runScan])

  const unlock = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem(KEY_STORAGE, entry)
    setKey(entry)
  }

  const apply = async () => {
    setStatus('applying')
    try {
      await callStudio(key, 'apply')
      setStatus('done')
    } catch {
      setError('Could not start the update.'); setStatus('error')
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
                <div><strong>{r.name}</strong><em>Gone from Sweatpals and out of dates</em></div>
              </li>
            ))}
            {scan.added.map((a) => (
              <li key={a.slug} className="studio-item studio-item--in">
                <span aria-hidden="true">+</span>
                <div><strong>{a.name}</strong><em>New on Sweatpals</em></div>
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
