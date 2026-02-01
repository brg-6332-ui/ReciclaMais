import {
  type Accessor,
  createEffect,
  createResource,
  createSignal,
  onCleanup,
} from 'solid-js'

/**
 * Options for the useGooglePlacesAutocomplete hook.
 */
export type GooglePlacesAutocompleteOptions = {
  /**
   * Whether the Google Maps script is loaded and ready.
   */
  isReady: Accessor<boolean>

  /**
   * The search query to get predictions for.
   */
  query: Accessor<string>
}

/**
 * Result from the useGooglePlacesAutocomplete hook.
 */
export type GooglePlacesAutocompleteResult = {
  /**
   * Autocomplete predictions for the current query.
   */
  predictions: Accessor<google.maps.places.AutocompletePrediction[]>

  /**
   * Whether predictions are currently loading.
   */
  loading: Accessor<boolean>

  /**
   * Autocomplete service instance.
   */
  service: Accessor<google.maps.places.AutocompleteService | null>

  /**
   * Current session token.
   */
  sessionToken: Accessor<
    google.maps.places.AutocompleteSessionToken | undefined
  >
}

/**
 * Hook for Google Places Autocomplete functionality.
 *
 * @param options - Configuration options
 * @returns Autocomplete predictions and service instance
 *
 * @example
 * const { predictions, loading } = useGooglePlacesAutocomplete({
 *   isReady: () => true,
 *   query: () => 'pizza'
 * })
 */
export function useGooglePlacesAutocomplete(
  options: GooglePlacesAutocompleteOptions,
): GooglePlacesAutocompleteResult {
  const [sessionToken, setSessionToken] =
    createSignal<google.maps.places.AutocompleteSessionToken>()
  const [autocompleteService, setAutocompleteService] =
    createSignal<google.maps.places.AutocompleteService | null>(null)

  createEffect(() => {
    if (!options.isReady()) return

    const globalWithGoogle = globalThis as unknown as {
      google?: {
        maps?: {
          places?: {
            AutocompleteSessionToken: new () => google.maps.places.AutocompleteSessionToken
            AutocompleteService: new () => google.maps.places.AutocompleteService
          }
        }
      }
    }

    if (!globalWithGoogle.google?.maps?.places) {
      console.warn('Google Maps Places API not available')
      return
    }

    setSessionToken(new google.maps.places.AutocompleteSessionToken())
    setAutocompleteService(new google.maps.places.AutocompleteService())

    onCleanup(() => {
      setAutocompleteService(null)
    })
  })

  const [predictions] = createResource(
    () => ({
      service: autocompleteService(),
      value: options.query(),
      token: sessionToken(),
    }),
    async (params) => {
      const { service, value, token } = params
      if (!value || !service) {
        return []
      }

      try {
        const response = await service.getPlacePredictions({
          input: value,
          sessionToken: token,
        })
        return response.predictions
      } catch (error) {
        console.warn('Error fetching autocomplete predictions', error)
        return []
      }
    },
    { initialValue: [] },
  )

  return {
    predictions: () => predictions() ?? [],
    loading: () => predictions.loading,
    service: autocompleteService,
    sessionToken,
  }
}
