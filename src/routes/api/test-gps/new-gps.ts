import { createGpsEntry } from '~/shared/infrastructure/gps-simulator/store'

import { parseJsonRequest } from './parseBody'

export async function POST(event: { request: Request }) {
  // Expect optional JSON body: { lat?: number, lng?: number }
  const { request } = event
  let body: unknown
  try {
    body = await parseJsonRequest(request)
  } catch {
    return new Response(JSON.stringify({ error: 'invalid json' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  let lat: number | null = null
  let lng: number | null = null
  if (typeof body === 'object' && body !== null) {
    const b = body as Record<string, unknown>
    lat = typeof b.lat === 'number' ? b.lat : null
    lng = typeof b.lng === 'number' ? b.lng : null
  }

  const id = createGpsEntry(lat, lng)
  return new Response(JSON.stringify({ id }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  })
}
