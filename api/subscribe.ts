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
    return res.status(500).json({ error: 'Server misconfigured' })
  }

  const response = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({ email, listIds: [18] }),
  })

  if (response.status === 201) {
    return res.status(200).json({ success: true })
  }

  if (response.status === 204) {
    // Contact already exists
    return res.status(200).json({ success: true })
  }

  const data = await response.json().catch(() => ({}))

  // Brevo returns "duplicate_parameter" if contact already exists
  if (data.code === 'duplicate_parameter') {
    return res.status(200).json({ success: true })
  }

  return res.status(500).json({ error: 'Failed to subscribe' })
}
