import { createEffect, createResource, createSignal, Suspense } from 'solid-js'

import { useDebouncedValue } from '~/modules/common/hooks/useDebouncedValue'
import { useGeolocation } from '~/modules/map/hooks/useGeolocation'
import { useGooglePlacesAutocomplete } from '~/modules/map/hooks/useGooglePlacesAutocomplete'
import { useGooglePlacesService } from '~/modules/map/hooks/useGooglePlacesService'

import { AutocompleteDropdown } from './AutocompleteDropdown'
import { SearchInput } from './SearchInput'

export type SearchPillProps = {
  onUseLocationClick?: (lat: number, lng: number) => void
  onSearch?: (query: string) => void
  onPlaceSelected?: (place: google.maps.places.PlaceResult['place_id']) => void
  /** Render compact variant (smaller input/icons) */
  compact?: boolean
}
/**
 * Search pill component with Google Places autocomplete.
 *
 * @param props - Component props
 * @returns Search pill UI with autocomplete functionality
 */
export function SearchPill(props: SearchPillProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  const [query, setQuery] = createSignal('')
  const [debouncedQuery, setDebouncedQuery] = useDebouncedValue('', 300)
  const [isOpen, setIsOpen] = createSignal(false)
  const [selectedPrediction, setSelectedPrediction] =
    createSignal<google.maps.places.AutocompletePrediction | null>(null)

  const [inputRef, setInputRef] = createSignal<HTMLInputElement | null>(null)

  const { service: placesService, isReady } = useGooglePlacesService({
    apiKey,
  })

  const { getCurrentPosition, loading: geoLoading } = useGeolocation({
    onSuccess: (position) => {
      console.log('[SearchPill] Got user location:', position)
      props.onUseLocationClick?.(position.lat, position.lng)
    },
    onError: (error) => {
      console.error('[SearchPill] Geolocation error:', error)
      alert(`Erro ao obter localização: ${error.message}`)
    },
  })

  const { predictions, loading } = useGooglePlacesAutocomplete({
    isReady,
    query: debouncedQuery,
  })

  createEffect(() => {
    const newQuery = query()
    if (newQuery !== debouncedQuery()) {
      setDebouncedQuery(newQuery)
    }
  })

  const [placeDetails] = createResource(
    () => ({
      service: placesService(),
      placeId: selectedPrediction()?.place_id,
    }),
    async ({ service, placeId }) => {
      if (!placeId || !service) return null

      try {
        const response =
          await new Promise<google.maps.places.PlaceResult | null>(
            (resolve, reject) => {
              service.getDetails({ placeId }, (result, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                  resolve(result)
                } else {
                  reject(new Error(`Places service error: ${status}`))
                }
              })
            },
          )

        return response
      } catch (err) {
        console.warn('Error fetching place details', err)
        return null
      }
    },
    { initialValue: null },
  )

  createEffect(() => {
    const details = placeDetails()
    if (details) {
      props.onPlaceSelected?.(details.place_id)
    }
  })

  const handleSelectPrediction = (
    prediction: google.maps.places.AutocompletePrediction,
  ) => {
    setQuery(prediction.structured_formatting.main_text)
    setSelectedPrediction(prediction)
    props.onPlaceSelected?.(prediction.place_id)
    setIsOpen(false)
    setTimeout(() => {
      inputRef()?.blur()
    }, 0)
  }

  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false)
    }, 200)
  }

  const handleFocus = () => {
    setIsOpen(true)
  }

  const handleUseLocationClick = () => {
    if (geoLoading()) return
    getCurrentPosition()
  }

  return (
    <div class="flex-1 min-w-0 relative">
      <SearchInput
        value={query}
        onInput={setQuery}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onUseLocationClick={
          props.onUseLocationClick ? handleUseLocationClick : undefined
        }
        loading={geoLoading}
        onSearch={props.onSearch}
        ref={setInputRef}
        compact={props.compact}
      />

      <Suspense fallback={null}>
        <AutocompleteDropdown
          isOpen={isOpen}
          query={query}
          predictions={predictions}
          loading={loading}
          onSelectPrediction={handleSelectPrediction}
        />
      </Suspense>
    </div>
  )
}
