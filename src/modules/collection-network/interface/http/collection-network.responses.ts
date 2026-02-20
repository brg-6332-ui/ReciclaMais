export type CollectionPointResponseDTO = {
  id: string
  slug: string | null
  type: string
  kind: 'collection-point' | 'gps'
  latitude: number
  longitude: number
  name: string
  address: string | null
  phone: string | null
  schedule: string | null
  rating: number | null
  company: string | null
  wasteTypes: string[]
  familiesPope: Array<{ slug: string }>
  locationTypesPope: Array<{ slug: string }>
  plainTypes: string
  plainFilters: string
}

export type CollectionPointsResponseDTO = {
  points: CollectionPointResponseDTO[]
}
