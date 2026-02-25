/**
 * Formatting utilities for the GPS quality dashboard.
 * Pure functions — no side effects, no DOM access.
 */

/**
 * Formats milliseconds into a human-readable duration string.
 * @param ms - Duration in milliseconds.
 * @returns e.g. "1.2 s", "45 ms", "2 min 3 s", "1 h 5 min"
 */
export function formatDurationMs(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) return '—'
  if (ms < 0) return '—'

  if (ms < 1000) return `${Math.round(ms)} ms`

  const totalSeconds = ms / 1000

  if (totalSeconds < 60) {
    return `${totalSeconds.toFixed(1)} s`
  }

  const totalMinutes = Math.floor(totalSeconds / 60)
  const remainingSeconds = Math.round(totalSeconds % 60)

  if (totalMinutes < 60) {
    return remainingSeconds > 0
      ? `${totalMinutes} min ${remainingSeconds} s`
      : `${totalMinutes} min`
  }

  const hours = Math.floor(totalMinutes / 60)
  const remainingMinutes = totalMinutes % 60

  return remainingMinutes > 0
    ? `${hours} h ${remainingMinutes} min`
    : `${hours} h`
}

/**
 * Formats an epoch timestamp (ms) into a locale-friendly datetime string.
 * @param ms - Unix timestamp in milliseconds.
 * @param tz - IANA timezone string.
 * @returns e.g. "25/02/2026, 14:32:05"
 */
export function formatTimestamp(
  ms: number | null | undefined,
  tz = 'Europe/Lisbon',
): string {
  if (ms === null || ms === undefined) return '—'
  try {
    return new Intl.DateTimeFormat('pt-PT', {
      timeZone: tz,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date(ms))
  } catch {
    return new Date(ms).toISOString()
  }
}

/**
 * Formats an epoch timestamp into a short time string (HH:MM:SS).
 * @param ms - Unix timestamp in milliseconds.
 * @param tz - IANA timezone string.
 */
export function formatTime(
  ms: number | null | undefined,
  tz = 'Europe/Lisbon',
): string {
  if (ms === null || ms === undefined) return '—'
  try {
    return new Intl.DateTimeFormat('pt-PT', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date(ms))
  } catch {
    return new Date(ms).toISOString().slice(11, 19)
  }
}

/**
 * Truncates a UUID to the first 8 characters for display.
 * @param id - Full UUID string.
 */
export function shortId(id: string): string {
  return id.slice(0, 8)
}

/**
 * Formats latitude/longitude pair for compact display.
 * @param lat - Latitude.
 * @param lng - Longitude.
 * @param precision - Decimal precision for both coordinates.
 */
export function formatLatLng(
  lat: number | null | undefined,
  lng: number | null | undefined,
  precision = 5,
): string {
  if (
    lat === null ||
    lat === undefined ||
    lng === null ||
    lng === undefined ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng)
  ) {
    return '—'
  }

  return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`
}

/**
 * Formats a "time ago" string from an epoch timestamp.
 * @param ms - Unix timestamp in milliseconds.
 * @returns e.g. "há 5 s", "há 2 min", "há 1 h"
 */
export function timeAgo(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) return '—'
  const diff = Date.now() - ms
  if (diff < 0) return 'agora'

  if (diff < 1000) return 'agora'
  if (diff < 60_000) return `há ${Math.floor(diff / 1000)} s`
  if (diff < 3_600_000) return `há ${Math.floor(diff / 60_000)} min`
  if (diff < 86_400_000) return `há ${Math.floor(diff / 3_600_000)} h`

  return `há ${Math.floor(diff / 86_400_000)} d`
}

/**
 * Generates an array of 24 hour labels (00–23) for the by-hour chart.
 */
export function generateHourLabels(): string[] {
  return Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
}

/**
 * Computes a human-readable TTL description.
 * @param ttlMs - Time-to-live in milliseconds.
 */
export function formatTtl(ttlMs: number): string {
  if (ttlMs < 1000) return `${ttlMs} ms`
  return `${(ttlMs / 1000).toFixed(0)} s`
}
