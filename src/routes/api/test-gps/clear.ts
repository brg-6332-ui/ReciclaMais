import { parseJsonRequest } from './parseBody'
import { clearAllTestData } from './store'

export async function POST(event: { request: Request }) {
  console.debug('Received request to clear GPS test data metrics')
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
    return new Response(JSON.stringify({ error: 'confirmation required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const b = body as Record<string, unknown>
  if (b.confirm !== true) {
    return new Response(JSON.stringify({ error: 'confirmation required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const result = await clearAllTestData()
    console.debug('GPS test data metrics cleared', result)

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Failed to clear GPS test data metrics', error)
    return new Response(JSON.stringify({ error: 'failed to clear data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
