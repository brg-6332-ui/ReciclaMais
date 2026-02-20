import type { CollectionPointId } from './value-objects/collection-point-id.vo'

export type CollectionPointKind = 'collection-point' | 'gps'

export type CollectionPointEntity = {
  id: CollectionPointId
  slug: string | null
  kind: CollectionPointKind
  sourceType: string
  latitude: number
  longitude: number
  name: string
  address: string | null
  phone: string | null
  schedule: string | null
  rating: number | null
  company: string | null
  wasteTypes: readonly string[]
  familiesPope: ReadonlyArray<{ slug: string }>
  locationTypesPope: ReadonlyArray<{ slug: string }>
  plainTypes: string
  plainFilters: string
}
