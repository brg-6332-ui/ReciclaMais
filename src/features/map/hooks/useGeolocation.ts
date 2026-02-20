import { createSignal, onCleanup } from 'solid-js'

/**
 * Simplified coordinates object.
 */
export type LatLngPosition = {
  lat: number
  lng: number
  accuracy?: number
}

/**
 * Options for the useGeolocation hook.
 */
export type UseGeolocationOptions = {
  /**
   * Whether to watch for position changes continuously.
   * @default false
   */
  watch?: boolean

  /**
   * Enable high accuracy mode (uses GPS).
   * @default true
   */
  enableHighAccuracy?: boolean

  /**
   * Maximum age of cached position in milliseconds.
   * @default 0
   */
  maximumAge?: number

  /**
   * Timeout for geolocation request in milliseconds.
   * @default 10000
   */
  timeout?: number

  /**
   * Callback fired when position is successfully retrieved.
   */
  onSuccess?: (position: LatLngPosition) => void

  /**
   * Callback fired when an error occurs.
   */
  onError?: (error: GeolocationPositionError) => void
}

/**
 * Result from the useGeolocation hook.
 */
export type UseGeolocationResult = {
  /**
   * Current position (null if not yet retrieved or error occurred).
   */
  position: () => LatLngPosition | null

  /**
   * Error object if geolocation failed.
   */
  error: () => GeolocationPositionError | null

  /**
   * Whether geolocation is currently being fetched.
   */
  loading: () => boolean

  /**
   * Whether geolocation is supported by the browser.
   */
  isSupported: boolean

  /**
   * Request current position (one-time).
   */
  getCurrentPosition: () => void
}

/**
 * Hook for browser geolocation API.
 *
 * Provides access to the user's current location with reactive state.
 *
 * @param options - Configuration options
 * @returns Geolocation state and methods
 *
 * @example
 * // Get current position on demand
 * const { position, loading, getCurrentPosition } = useGeolocation()
 *
 * @example
 * // Watch position continuously
 * const { position } = useGeolocation({
 *   watch: true,
 *   onSuccess: (pos) => console.log('New position:', pos)
 * })
 */
export function useGeolocation(
  options: UseGeolocationOptions = {},
): UseGeolocationResult {
  const {
    watch = false,
    enableHighAccuracy = true,
    maximumAge = 0,
    timeout = 10000,
    onSuccess,
    onError,
  } = options

  const isSupported = 'geolocation' in navigator

  const [position, setPosition] = createSignal<LatLngPosition | null>(null)
  const [error, setError] = createSignal<GeolocationPositionError | null>(null)
  const [loading, setLoading] = createSignal(false)

  const positionOptions: PositionOptions = {
    enableHighAccuracy,
    maximumAge,
    timeout,
  }

  const handleSuccess = (pos: GeolocationPosition) => {
    const newPosition: LatLngPosition = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
    }
    setPosition(newPosition)
    setError(null)
    setLoading(false)
    onSuccess?.(newPosition)
  }

  const handleError = (err: GeolocationPositionError) => {
    setError(err)
    setLoading(false)
    onError?.(err)
    console.error('[useGeolocation] Error:', err.message)
  }

  const getCurrentPosition = () => {
    if (!isSupported) {
      console.error('[useGeolocation] Geolocation not supported')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      positionOptions,
    )
  }

  // Auto-start if watch is enabled
  if (watch && isSupported) {
    const watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      positionOptions,
    )

    onCleanup(() => {
      navigator.geolocation.clearWatch(watchId)
    })
  }

  return {
    position,
    error,
    loading,
    isSupported,
    getCurrentPosition,
  }
}
