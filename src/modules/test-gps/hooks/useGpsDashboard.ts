import { createEffect, createSignal, onCleanup, onMount } from 'solid-js'

import type {
  FetchStatus,
  GpsApiResponse,
  GpsFilters,
} from '~/modules/test-gps/types'

const DEFAULT_REFRESH_MS = 5_000

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
  const [paused, setPaused] = createSignal(false)
  const [lastUpdatedMs, setLastUpdatedMs] = createSignal<number | null>(null)

  let abortController: AbortController | null = null
  let refreshTimer: ReturnType<typeof setInterval> | null = null

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
    if (abortController) {
      abortController.abort()
    }
    abortController = new AbortController()

    setStatus('loading')
    setError(null)

    try {
      const response = await fetch(buildUrl(), {
        signal: abortController.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const json = (await response.json()) as GpsApiResponse
      setData(json)
      setStatus('success')
      setLastUpdatedMs(Date.now())
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return
      }
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      setStatus('error')
    } finally {
      abortController = null
    }
  }

  /**
   * Starts or restarts the auto-refresh interval.
   */
  function startRefresh() {
    stopRefresh()
    refreshTimer = setInterval(() => {
      if (!paused()) {
        void fetchData()
      }
    }, DEFAULT_REFRESH_MS)
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

  return {
    // State (signals)
    filters,
    data,
    status,
    error,
    paused,
    lastUpdatedMs,

    // Actions
    setFilters,
    setPaused,
    fetchData: () => void fetchData(),
    togglePause: () => setPaused((prev) => !prev),
  }
}
