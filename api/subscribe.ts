import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email } = req.body || {}
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' })
  }

  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Server misconfigured', detail: 'BREVO_API_KEY not set' })
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({ email, listIds: [18] }),
    })

    const data = await response.json().catch(() => ({}))

    if (response.status === 201) {
      return res.status(200).json({ success: true })
    }

    if (response.status === 204 || data.code === 'duplicate_parameter') {
      return res.status(200).json({ success: true })
    }

    return res.status(500).json({ error: 'Brevo error', status: response.status, detail: data })
  } catch (err) {
    return res.status(500).json({ error: 'Request failed', detail: String(err) })
  }
}
