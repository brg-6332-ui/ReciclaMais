import {
  createEffect,
  createMemo,
  createResource,
  createSignal,
  Show,
  Suspense,
} from 'solid-js'

import type { WasteTypeCatalogEntry } from '~/features/collection-points/utils/wasteSearch'
import {
  resolveWasteType,
  searchWasteTypes,
} from '~/features/collection-points/utils/wasteSearch'
import { useGeolocation } from '~/features/map/hooks/useGeolocation'
import { useGooglePlacesAutocomplete } from '~/features/map/hooks/useGooglePlacesAutocomplete'
import { useGooglePlacesService } from '~/features/map/hooks/useGooglePlacesService'
import { useDebouncedValue } from '~/features/shell/hooks/useDebouncedValue'

import { AutocompleteDropdown } from './AutocompleteDropdown'
import { SearchInput } from './SearchInput'
import { WasteTypeSuggestions } from './WasteTypeSuggestions'

export type SearchPillProps = {
  onUseLocationClick?: (lat: number, lng: number) => void
  onSearch?: (query: string) => void
  onPlaceSelected?: (place: google.maps.places.PlaceResult['place_id']) => void
  /** Callback when a waste type is selected from suggestions */
  onWasteTypeSelected?: (wasteType: string) => void
  /** Render compact variant (smaller input/icons) */
  compact?: boolean
}
/**
 * Search pill component with Google Places autocomplete and waste type suggestions.
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

  // Waste type suggestions based on query
  const wasteTypeSuggestions = createMemo(() => {
    const q = query()
    if (q.length < 2) return []
    return searchWasteTypes(q)
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

  const handleWasteTypeSelect = (entry: WasteTypeCatalogEntry) => {
    setQuery(entry.label)
    setIsOpen(false)
    props.onWasteTypeSelected?.(entry.value)
    setTimeout(() => {
      inputRef()?.blur()
    }, 0)
  }

  /** Handle Enter key or search button: resolve waste type first, fall back to search */
  const handleSearchSubmit = (searchQuery: string) => {
    const wasteType = resolveWasteType(searchQuery)
    if (wasteType && props.onWasteTypeSelected) {
      props.onWasteTypeSelected(wasteType)
      setIsOpen(false)
      return
    }
    props.onSearch?.(searchQuery)
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
        onSearch={handleSearchSubmit}
        ref={setInputRef}
        compact={props.compact}
        placeholder={
          props.onWasteTypeSelected
            ? 'Pesquisar resíduo (ex.: pilhas, vidro, papel…)'
            : undefined
        }
      />

      <Suspense fallback={null}>
        <Show when={isOpen() && query().length > 0}>
          <div class="absolute top-full left-0 right-0 mt-2 bg-base-50 border border-base-300 rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
            <WasteTypeSuggestions
              suggestions={wasteTypeSuggestions}
              onSelect={handleWasteTypeSelect}
            />
            <AutocompleteDropdown
              isOpen={() => true}
              query={query}
              predictions={predictions}
              loading={loading}
              onSelectPrediction={handleSelectPrediction}
              inline
            />
          </div>
        </Show>
      </Suspense>
    </div>
  )
}
