export type POIBasic = {
  id: string | number
  latitude: number
  longitude: number
  slug: string
  type: string
  families_pope: { slug: string }[]
  location_types_pope: { slug: string }[]
  wasteTypes: string[]
  plainTypes: string
  plainFilters: string
}
