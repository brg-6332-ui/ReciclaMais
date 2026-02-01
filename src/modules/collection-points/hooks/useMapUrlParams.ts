import { Accessor, createSignal, Setter } from 'solid-js'

import { useStringSearchParam } from '~/modules/common/hooks/useStringSearchParam'

/**
 * Hook for managing map-related URL parameters.
 * Reads lat/lng/search/placeId/fullscreen from URL query params and provides signals for reactive updates.
 * @returns Object with all map-related signals and setters
 */
export function useMapUrlParams() {
  const [getLatParam] = useStringSearchParam('lat')
  const [getLngParam] = useStringSearchParam('lng')
  const [getSearchParam] = useStringSearchParam('search')
  const [getPlaceIdParam] = useStringSearchParam('placeId')
  const [getFullscreenParam] = useStringSearchParam('fullscreen')

  // Initialize from URL params
  const latFromUrl = getLatParam()
  const lngFromUrl = getLngParam()
  const searchFromUrl = getSearchParam()
  const placeIdFromUrl = getPlaceIdParam()
  const fullscreenFromUrl = getFullscreenParam()

  const [userLat, setUserLat] = createSignal<number | null>(
    latFromUrl ? parseFloat(latFromUrl) : null,
  )
  const [userLng, setUserLng] = createSignal<number | null>(
    lngFromUrl ? parseFloat(lngFromUrl) : null,
  )
  const [search, setSearch] = createSignal<string | null>(searchFromUrl)
  const [placeId, setPlaceId] = createSignal<string | null>(placeIdFromUrl)
  const [isFullscreen, setIsFullscreen] = createSignal<boolean>(
    fullscreenFromUrl === 'true',
  )

  return {
    userLat,
    setUserLat,
    userLng,
    setUserLng,
    search,
    setSearch,
    placeId,
    setPlaceId,
    isFullscreen,
    setIsFullscreen,
  }
}

export type MapUrlParams = {
  userLat: Accessor<number | null>
  setUserLat: Setter<number | null>
  userLng: Accessor<number | null>
  setUserLng: Setter<number | null>
  search: Accessor<string | null>
  setSearch: Setter<string | null>
  placeId: Accessor<string | null>
  setPlaceId: Setter<string | null>
  isFullscreen: Accessor<boolean>
  setIsFullscreen: Setter<boolean>
}
