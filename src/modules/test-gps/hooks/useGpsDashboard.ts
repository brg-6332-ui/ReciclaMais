import { createEffect, createSignal, onCleanup, onMount } from 'solid-js'

import type {
  FetchStatus,
  GpsApiResponse,
  GpsFilters,
} from '~/modules/test-gps/types'

const DEFAULT_REFRESH_MS = 5_000
const MIN_REFRESH_MS = 3_000
const MAX_REFRESH_MS = 15_000

/**
 * Hook that manages fetching, auto-refresh, abort, and visibility-pause
 * for the GPS quality dashboard.
 *
 * @param initialFilters - Default filter values.
 * @returns Reactive state and action callbacks.
 */
export function useGpsDashboard(initialFilters: GpsFilters) {
  const [filters, setFilters] = createSignal<GpsFilters>(initialFilters)
  const [data, setData] = createSignal<GpsApiResponse | null>(null)
  const [status, setStatus] = createSignal<FetchStatus>('idle')
  const [error, setError] = createSignal<string | null>(null)
  const [clearing, setClearing] = createSignal(false)
  const [paused, setPaused] = createSignal(false)
  const [lastUpdatedMs, setLastUpdatedMs] = createSignal<number | null>(null)

  let abortController: AbortController | null = null
  let refreshTimer: ReturnType<typeof setInterval> | null = null

  /**
   * Computes auto-refresh interval based on backend TTL when available.
   * Rule: min(max(ttl/2, 3000), 15000), fallback to default 5000ms.
   */
  function getRefreshIntervalMs(payload: GpsApiResponse | null): number {
    const ttlMs = payload?.gps.ttlMs
    if (!Number.isFinite(ttlMs) || !ttlMs || ttlMs <= 0) {
      return DEFAULT_REFRESH_MS
    }

    const halfTtl = Math.floor(ttlMs / 2)
    return Math.min(MAX_REFRESH_MS, Math.max(MIN_REFRESH_MS, halfTtl))
  }

  /**
   * Builds the API URL from current filters.
   */
  function buildUrl(): string {
    const f = filters()
    const params = new URLSearchParams()
    params.set('window_h', String(f.windowH))
    params.set('tz', f.tz)
    if (f.includeOutageEvents) {
      params.set('include_outage_events', '1')
      params.set('events_limit', String(f.eventsLimit))
    }
    return `/api/test-gps?${params.toString()}`
  }

  /**
   * Fetches the GPS data from the backend.
   * Cancels any in-flight request via AbortController.
   */
  async function fetchData() {
    const controller = new AbortController()
    if (abortController) {
      abortController.abort()
    }
    abortController = controller

    setStatus('loading')
    setError(null)

    try {
      const response = await fetch(buildUrl(), {
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const json = (await response.json()) as GpsApiResponse
      setData(json)
      setStatus('success')
      setLastUpdatedMs(Date.now())
      if (!paused() && !document.hidden) {
        startRefresh(json)
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return
      }
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      setStatus('error')
    } finally {
      if (abortController === controller) {
        abortController = null
      }
    }
  }

  /**
   * Starts or restarts the auto-refresh interval.
   */
  function startRefresh(payload: GpsApiResponse | null = data()) {
    stopRefresh()
    const intervalMs = getRefreshIntervalMs(payload)
    refreshTimer = setInterval(() => {
      if (!paused()) {
        void fetchData()
      }
    }, intervalMs)
  }

  /**
   * Stops the auto-refresh interval.
   */
  function stopRefresh() {
    if (refreshTimer !== null) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }

  /**
   * Handles page visibility changes — pause when hidden, resume when visible.
   */
  function handleVisibilityChange() {
    if (document.hidden) {
      stopRefresh()
    } else if (!paused()) {
      void fetchData()
      startRefresh()
    }
  }

  onMount(() => {
    void fetchData()
    startRefresh()
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onCleanup(() => {
    stopRefresh()
    if (abortController) {
      abortController.abort()
    }
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })

  // Restart refresh when paused state changes
  createEffect(() => {
    if (paused()) {
      stopRefresh()
    } else {
      startRefresh()
    }
  })

  /**
   * Clears all persisted GPS test metrics (sessions + outages) from backend.
   * On success, refreshes dashboard data.
   */
  async function clearAllData() {
    if (clearing()) return

    setClearing(true)
    try {
      const response = await fetch('/api/test-gps/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      setError(null)
      await fetchData()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(`Falha ao limpar métricas: ${message}`)
    } finally {
      setClearing(false)
    }
  }

  return {
    // State (signals)
    filters,
    data,
    status,
    error,
    clearing,
    paused,
    lastUpdatedMs,

    // Actions
    setFilters,
    setPaused,
    fetchData: () => void fetchData(),
    clearAllData: () => void clearAllData(),
    togglePause: () => setPaused((prev) => !prev),
  }
}
