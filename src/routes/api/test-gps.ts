import { getActiveEntries, TTL_MS } from '~/routes/api/test-gps/store'

export function GET() {
  const entries = getActiveEntries()
  return new Response(JSON.stringify({ gps: { entries, ttlMs: TTL_MS } }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
