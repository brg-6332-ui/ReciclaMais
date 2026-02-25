import { parseJsonRequest } from './parseBody'
import { updateEntry } from './store'

export async function POST(event: { request: Request }) {
  console.debug('Received GPS update request')
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

  if (typeof body !== 'object' || body === null) {
    return new Response(JSON.stringify({ error: 'missing id, lat or lng' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const b = body as Record<string, unknown>
  if (
    typeof b.id !== 'string' ||
    typeof b.lat !== 'number' ||
    typeof b.lng !== 'number'
  ) {
    return new Response(JSON.stringify({ error: 'missing id, lat or lng' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const entry = updateEntry(b.id, b.lat, b.lng)
  if (!entry) {
    console.debug('GPS update request: entry not found')
    return new Response(JSON.stringify({ error: 'not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  console.debug('GPS update request: entry updated', entry)
  return new Response(JSON.stringify({ ok: true, entry }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
