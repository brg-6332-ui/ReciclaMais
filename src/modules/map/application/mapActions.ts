export const mapActions = {
  openMapsPageWithSearch: (search: string) => {
    // Opens /map route with search query param
    const url = new URL(window.location.origin + '/map')
    if (search) {
      url.searchParams.set('search', search)
    }
    // TODO: use router navigation instead of full page reload
    window.location.href = url.toString()
  },

  openMapPageWithPlaceId: (placeId: string | undefined) => {
    // Opens /map route with placeId query param
    const url = new URL(window.location.origin + '/map')
    if (placeId) {
      url.searchParams.set('placeId', placeId)
    }

    // TODO: use router navigation instead of full page reload
    window.location.href = url.toString()
  },

  openMapPageWithCoordinates: (lat: number, lng: number) => {
    // Opens /map route with coordinates query params
    const url = new URL(window.location.origin + '/map')
    url.searchParams.set('lat', lat.toString())
    url.searchParams.set('lng', lng.toString())

    // TODO: use router navigation instead of full page reload
    window.location.href = url.toString()
  },
}
