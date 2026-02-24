import { useNavigate } from '@solidjs/router'

/**
 * Hook that returns navigation actions for the map page.
 * Must be called inside a SolidJS component or reactive context.
 */
export function useMapActions() {
  const navigate = useNavigate()

  return {
    /** Navigates to /map with a search query param. */
    openMapsPageWithSearch: (search: string) => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      const qs = params.toString()
      navigate('/map' + (qs ? '?' + qs : ''))
    },

    /** Navigates to /map with a placeId query param. */
    openMapPageWithPlaceId: (placeId: string | undefined) => {
      const params = new URLSearchParams()
      if (placeId) params.set('placeId', placeId)
      const qs = params.toString()
      navigate('/map' + (qs ? '?' + qs : ''))
    },

    /** Navigates to /map with lat/lng coordinate query params. */
    openMapPageWithCoordinates: (lat: number, lng: number) => {
      const params = new URLSearchParams()
      params.set('lat', lat.toString())
      params.set('lng', lng.toString())
      navigate('/map?' + params.toString())
    },

    /**
     * Navigates to the map page filtered by a waste type.
     * @param wasteType - Canonical waste type value (e.g. 'plastic', 'batteries')
     */
    openMapPageWithWasteType: (wasteType: string) => {
      const params = new URLSearchParams()
      params.set('waste', wasteType)
      navigate('/map?' + params.toString())
    },
  }
}
