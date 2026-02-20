export type CollectionPointRow = {
  id: string | number
  latitude: string | number
  longitude: string | number
  slug?: string
  type?: string
  families_pope?: unknown
  location_types_pope?: unknown
  plainTypes?: unknown
  plainFilters?: unknown
  name?: unknown
  address?: unknown
  phone?: unknown
  schedule?: unknown
  rating?: unknown
  company?: unknown
  wasteTypes?: unknown
}

export type CollectionPointsPoiFile = {
  data: {
    publicGetMapInformation: {
      points: CollectionPointRow[]
    }
  }
}
