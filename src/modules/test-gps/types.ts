/**
 * Types for the GPS quality monitoring dashboard.
 * Mirrors the backend API response shape from GET /api/test-gps.
 */

/** A single GPS session entry as returned by the API. */
export type GpsEntry = {
  id: string
  lat: number | null
  lng: number | null
  lastSeen: number
  quality: {
    first_fix_at_ms: number | null
    ttff_ms: number | null
    outage_count: number
    outage_total_ms: number
    outage_max_ms: number
    open_outage: boolean
    open_outage_reason: string | null
  }
}

/** A clipped outage event within the summary window. */
export type SummaryEvent = {
  session_id: string
  reason: string
  open: boolean
  start_ms: number
  end_ms: number
  clip_start_ms: number
  clip_end_ms: number
  clip_duration_ms: number
}

/** 24-hour (or custom window) summary data. */
export type Summary24h = {
  window: {
    start_ms: number
    end_ms: number
    hours: number
    timezone: string
  }
  sessions: {
    count: number
    reconnect_total: number
    ttff: {
      count: number
      avg_ms: number
      max_ms: number
    }
  }
  outages: {
    count: number
    open_count: number
    total_duration_ms: number
    max_duration_ms: number
    by_hour: Record<string, number>
    events?: SummaryEvent[]
  }
}

/** Root payload from GET /api/test-gps. */
export type GpsApiResponse = {
  gps: {
    entries: GpsEntry[]
    ttlMs: number
    summary24h: Summary24h
  }
}

/** Filter parameters for the control bar. */
export type GpsFilters = {
  windowH: number
  tz: string
  includeOutageEvents: boolean
  eventsLimit: number
}

/** Possible states for the dashboard data. */
export type FetchStatus = 'idle' | 'loading' | 'success' | 'error'
