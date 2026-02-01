import { parseJsonRequest } from './parseBody'
import { heartbeat } from './store'

export async function POST(event: { request: Request }) {
  // Expect JSON body: { id: string }
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
    return new Response(JSON.stringify({ error: 'missing id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const b = body as Record<string, unknown>
  if (typeof b.id !== 'string') {
    return new Response(JSON.stringify({ error: 'missing id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  const ok = heartbeat(b.id)
  if (!ok) {
    return new Response(JSON.stringify({ error: 'not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
