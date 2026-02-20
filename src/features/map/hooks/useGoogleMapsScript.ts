import { type Accessor, createSignal, onMount } from 'solid-js'

/**
 * Loads the Google Maps JavaScript API if not already loaded.
 *
 * @param apiKey - Google Maps API key
 * @returns Signal indicating whether the script is loaded
 *
 * @example
 * const isLoaded = useGoogleMapsScript(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)
 */
export function useGoogleMapsScript(apiKey?: string): Accessor<boolean> {
  const [isLoaded, setIsLoaded] = createSignal(false)

  onMount(() => {
    const globalWithGoogle = globalThis as unknown as {
      google?: {
        maps?: object
      }
    }

    if (globalWithGoogle.google?.maps) {
      setIsLoaded(true)
      return
    }

    if (!apiKey) {
      console.warn('Google Maps API key not provided to useGoogleMapsScript')
      return
    }

    loadMapsScript(apiKey)
      .then(() => {
        setIsLoaded(true)
      })
      .catch((err) => {
        console.warn('Failed to load Google Maps script', err)
      })
  })

  return isLoaded
}

/**
 * Loads the Google Maps JavaScript API dynamically.
 *
 * @param apiKey - Google Maps API key
 * @returns Promise that resolves when the script is loaded
 */
function loadMapsScript(apiKey: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const globalWithGoogle = globalThis as unknown as {
      google?: {
        maps?: object
      }
    }

    if (globalWithGoogle.google?.maps) {
      resolve()
      return
    }

    const existing = document.querySelector(
      `script[src*="maps.googleapis.com/maps/api/js"]`,
    )

    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () =>
        reject(new Error('Failed to load Google Maps script')),
      )
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.addEventListener('load', () => resolve())
    script.addEventListener('error', () =>
      reject(new Error('Failed to load Google Maps script')),
    )
    document.head.appendChild(script)
  })
}
