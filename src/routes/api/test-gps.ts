import {
  getActiveGpsEntries,
  TTL_MS,
} from '~/shared/infrastructure/gps-simulator/store'

export function GET() {
  const entries = getActiveGpsEntries()
  return new Response(JSON.stringify({ gps: { entries, ttlMs: TTL_MS } }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
