import { parseJsonRequest } from './parseBody'
import { heartbeat } from './store'

export async function POST(event: { request: Request }) {
  // Expect JSON body: { id: string }
  console.debug('Received heartbeat request')
  const { request } = event
  let body: unknown
  try {
    body = await parseJsonRequest(request)
  } catch {
    console.debug('Failed to parse JSON body')
    return new Response(JSON.stringify({ error: 'invalid json' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  if (typeof body !== 'object' || body === null) {
    console.debug('Heartbeat request: missing body')
    return new Response(JSON.stringify({ error: 'missing id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const b = body as Record<string, unknown>
  if (typeof b.id !== 'string') {
    console.debug('Heartbeat request: missing id')
    return new Response(JSON.stringify({ error: 'missing id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  const ok = await heartbeat(b.id)
  if (!ok) {
    console.debug('Heartbeat request: entry not found')
    return new Response(JSON.stringify({ error: 'not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  console.debug('Heartbeat received for entry', b.id)
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
