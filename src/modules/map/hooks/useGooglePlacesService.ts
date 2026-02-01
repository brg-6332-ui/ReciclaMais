import { useMapsLibrary } from 'solid-google-maps'
import { type Accessor, createEffect, createSignal } from 'solid-js'

import { useGoogleMapsScript } from './useGoogleMapsScript'

/**
 * Options for the useGooglePlacesService hook.
 */
export type GooglePlacesServiceOptions = {
  /**
   * Optional map reference. If provided, PlacesService will be bound to the map.
   * If not provided, a hidden container will be used.
   */
  mapRef?: Accessor<google.maps.Map | null>

  /**
   * Google Maps API key (required only if not using solid-google-maps APIProvider).
   */
  apiKey?: string
}

/**
 * Result from the useGooglePlacesService hook.
 */
export type GooglePlacesServiceResult = {
  /**
   * PlacesService instance.
   */
  service: Accessor<google.maps.places.PlacesService | null>

  /**
   * Whether the service is ready to use.
   */
  isReady: Accessor<boolean>
}

/**
 * Hook for Google Places Service.
 *
 * Can be used with or without a map reference:
 * - With map: Binds PlacesService to the map instance
 * - Without map: Uses a hidden container
 *
 * @param options - Configuration options
 * @returns PlacesService instance and ready state
 *
 * @example
 * // With map (inside APIProvider)
 * const { service } = useGooglePlacesService({ mapRef })
 *
 * @example
 * // Without map (standalone)
 * const { service } = useGooglePlacesService({
 *   apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
 * })
 */
export function useGooglePlacesService(
  options: GooglePlacesServiceOptions = {},
): GooglePlacesServiceResult {
  const placesLibrary = useMapsLibrary('places')
  // Only load script if we're NOT using a map ref and have an apiKey
  const fallbackScriptLoaded = useGoogleMapsScript(
    options.mapRef ? undefined : options.apiKey,
  )

  const [placesService, setPlacesService] =
    createSignal<google.maps.places.PlacesService | null>(null)

  const isReady = () => {
    // If we have a mapRef, we're inside APIProvider - wait for the map
    if (options.mapRef) {
      return Boolean(options.mapRef())
    }
    // Otherwise, use the fallback script loading
    return Boolean(placesLibrary()) || fallbackScriptLoaded()
  }

  createEffect(() => {
    // Explicitly track mapRef if provided to ensure effect re-runs
    const map = options.mapRef?.()
    // Also track placesLibrary to re-run when it loads
    const placesLib = placesLibrary()

    console.log('[useGooglePlacesService] Effect running', {
      isReady: isReady(),
      placesLibrary: Boolean(placesLib),
      fallbackScriptLoaded: fallbackScriptLoaded(),
      hasMapRef: Boolean(options.mapRef),
      map: map,
    })

    // When using mapRef, wait for BOTH map AND places library
    if (options.mapRef) {
      if (!map) {
        console.log('[useGooglePlacesService] Waiting for map')
        return
      }
      if (!placesLib) {
        console.log('[useGooglePlacesService] Waiting for places library')
        return
      }
      console.log('[useGooglePlacesService] Map and places library ready')
    } else {
      // Without mapRef, use the original isReady check
      if (!isReady()) {
        console.log('[useGooglePlacesService] Not ready yet')
        return
      }
    }

    const globalWithGoogle = globalThis as unknown as {
      google?: {
        maps?: {
          places?: {
            PlacesService: new (
              container: HTMLDivElement | google.maps.Map,
            ) => google.maps.places.PlacesService
          }
        }
      }
    }

    if (!globalWithGoogle.google?.maps?.places) {
      console.warn(
        '[useGooglePlacesService] Google Maps Places API not available yet, will retry',
      )
      return
    }

    console.log('[useGooglePlacesService] Map status', {
      hasMap: Boolean(map),
    })

    if (map) {
      // Use map as container
      console.log('[useGooglePlacesService] Creating service with map')
      setPlacesService(new google.maps.places.PlacesService(map))
    } else {
      // Use hidden container
      console.log(
        '[useGooglePlacesService] Creating service with hidden container',
      )
      const hiddenContainer = document.createElement('div')
      setPlacesService(new google.maps.places.PlacesService(hiddenContainer))
    }
  })

  return {
    service: placesService,
    isReady,
  }
}
