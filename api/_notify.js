const STUDIO_URL = 'https://www.loveandlob.co/studio'

/**
 * Turn a reconcile outcome into an email a human wants to read. Event NAMES
 * only — the whole point of this system is that nobody has to think about
 * slugs.
 */
export function formatReport({ added, removed, blocked, scanOk }) {
  if (!scanOk) {
    return {
      subject: 'Schedule: could not read Sweatpals',
      text: [
        'The reconcile job could not read the Sweatpals host page.',
        '',
        'The site is still serving the last known-good program list, so nothing',
        'is broken right now — but it will go stale if this keeps failing.',
        'Most likely Sweatpals changed their page structure.',
        '',
        `Check ${STUDIO_URL}`,
      ].join('\n'),
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

  const lines = ['The schedule was updated automatically.', '']
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
  lines.push('This is live on loveandlob.co/schedule within a couple of minutes.')

  return { subject: 'Schedule updated automatically', text: lines.join('\n') }
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
