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

  const result = await updateEntry(b.id, b.lat, b.lng)
  if (!result) {
    console.debug('GPS update request: entry not found')
    return new Response(JSON.stringify({ error: 'not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  console.debug('GPS update request: entry updated', result.entry)
  return new Response(
    JSON.stringify({
      ok: true,
      entry: result.entry,
      ignored: result.ignored,
      invalid_reason: result.invalidReason,
      ttff_ms: result.ttffMs,
      last: result.last,
      metrics: result.metrics,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  )
}
