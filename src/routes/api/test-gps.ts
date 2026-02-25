import {
  DEFAULT_SUMMARY_TIMEZONE,
  getActiveEntries,
  getSummary24h,
  TTL_MS,
} from '~/routes/api/test-gps/store'

function parseWindowHours(raw: string | null): number | undefined {
  if (!raw) return undefined
  const value = Number(raw)
  if (!Number.isFinite(value)) return undefined
  return value
}

function parseEventsLimit(raw: string | null): number | undefined {
  if (!raw) return undefined
  const value = Number(raw)
  if (!Number.isFinite(value)) return undefined
  return value
}

function parseIncludeEvents(raw: string | null): boolean {
  if (!raw) return false
  return raw === '1' || raw.toLowerCase() === 'true'
}

export async function GET(event: { request: Request }) {
  const url = new URL(event.request.url)
  const windowHours = parseWindowHours(url.searchParams.get('window_h'))
  const timezone =
    url.searchParams.get('tz')?.trim() ||
    url.searchParams.get('timezone')?.trim() ||
    DEFAULT_SUMMARY_TIMEZONE
  const includeOutageEvents = parseIncludeEvents(
    url.searchParams.get('include_outage_events'),
  )
  const eventsLimit = parseEventsLimit(url.searchParams.get('events_limit'))

  const [entries, summary24h] = await Promise.all([
    getActiveEntries(),
    getSummary24h({
      windowHours,
      timezone,
      includeOutageEvents,
      eventsLimit,
    }),
  ])

  return new Response(
    JSON.stringify({ gps: { entries, ttlMs: TTL_MS, summary24h } }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  )
}
