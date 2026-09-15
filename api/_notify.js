const STUDIO_URL = 'https://www.loveandlob.co/studio'

/**
 * Turn a reconcile outcome into an email a human wants to read. Event NAMES
 * only — the whole point of this system is that nobody has to think about
 * slugs.
 *
 * `rejected` (alias values the slug charset rejected, from `fetchHostScan`)
 * and `verdicts` (the full per-slug verdict list from `classify()`) are both
 * optional and default to empty — every call site that doesn't have them
 * (e.g. a blocked run, which fails before a scan-failure or classify() call
 * would produce them) still gets a valid report.
 */
export function formatReport({ added, removed, blocked, scanOk, rejected = [], verdicts = [] }) {
  if (!scanOk) {
    const lines = [
      'The reconcile job could not read the Sweatpals host page.',
      '',
      'The site is still serving the last known-good program list, so nothing',
      'is broken right now — but it will go stale if this keeps failing.',
      'Most likely Sweatpals changed their page structure.',
    ]
    if (rejected.length) {
      lines.push(
        '',
        'One likely cause: the page contained alias value(s) that could not be',
        'read as slugs:',
        ...rejected.map((v) => `  - ${v}`),
      )
    }
    lines.push('', `Check ${STUDIO_URL}`)
    return {
      subject: 'Schedule: could not read Sweatpals',
      text: lines.join('\n'),
    }
  }

  if (blocked) {
    return {
      subject: 'Schedule: a change needs a look before it goes live',
      text: [
        'The reconcile job found a change big enough that it stopped rather',
        'than applying it automatically.',
        '',
        blocked.reason,
        '',
        `Review and apply it here: ${STUDIO_URL}`,
      ].join('\n'),
    }
  }

  // Delisted from Sweatpals but still carrying a future date — the
  // early-warning state this whole project exists to catch. classify() keeps
  // these on the curated list unconditionally (never auto-removed), so they
  // never show up in `added`/`removed` — this is the only place they surface.
  const orphans = verdicts.filter((v) => v.verdict === 'orphan')
  const changed = added.length > 0 || removed.length > 0

  const lines = [
    changed
      ? 'The schedule was updated automatically.'
      : 'Nothing on the curated list changed, but a program needs a look.',
    '',
  ]
  if (added.length) {
    lines.push('Added:')
    for (const a of added) lines.push(`  + ${a.name}`)
    lines.push('')
  }
  if (removed.length) {
    lines.push('Removed (gone from Sweatpals and out of dates):')
    for (const r of removed) lines.push(`  - ${r.name}`)
    lines.push('')
  }
  if (orphans.length) {
    lines.push('Delisted but still scheduled (kept on the site — check Sweatpals for these):')
    for (const o of orphans) lines.push(`  ! ${o.name}`)
    lines.push('')
  }
  lines.push(
    changed
      ? 'This is live on loveandlob.co/schedule within a couple of minutes.'
      : `Review at ${STUDIO_URL}`,
  )

  const subject = changed
    ? 'Schedule updated automatically'
    : 'Schedule: a delisted program is still on the calendar'

  return { subject, text: lines.join('\n') }
}

/**
 * Send via Brevo, reusing the key already used by api/subscribe.ts. Returns
 * false rather than throwing: a failed notification must never fail the job
 * that already committed a good change.
 */
export async function sendReport(report, { apiKey, to }) {
  if (!apiKey || !to?.length) return false
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { name: 'Love & Lob Schedule', email: 'info@loveandlob.co' },
        to: to.map((email) => ({ email })),
        subject: report.subject,
        textContent: report.text,
      }),
    })
    return res.ok
  } catch {
    return false
  }
}
