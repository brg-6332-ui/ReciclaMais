import type { ListCollectionPointsResult } from '../../application/results/list-collection-points.result'
import type {
  CollectionPointResponseDTO,
  CollectionPointsResponseDTO,
} from './collection-network.responses'

export function listCollectionPointsResultToResponseDTO(
  result: ListCollectionPointsResult,
): CollectionPointsResponseDTO {
  return {
    points: result.points.map((point) => ({
      id: point.id,
      slug: point.slug,
      type: point.sourceType,
      kind: point.kind,
      latitude: point.latitude,
      longitude: point.longitude,
      name: point.name,
      address: point.address,
      phone: point.phone,
      schedule: point.schedule,
      rating: point.rating,
      company: point.company,
      wasteTypes: [...point.wasteTypes],
      familiesPope: [...point.familiesPope],
      locationTypesPope: [...point.locationTypesPope],
      plainTypes: point.plainTypes,
      plainFilters: point.plainFilters,
    })),
  }
}

export type LegacyFeatureCollection = {
  type: 'FeatureCollection'
  features: Array<{
    type: 'Feature'
    id: string
    properties: {
      id: string
      latitude: number
      longitude: number
      slug?: string
      type: string
      families_pope: Array<{ slug: string }>
      location_types_pope: Array<{ slug: string }>
      plainTypes: string
      plainFilters: string
      name?: string
      address?: string
      phone?: string
      schedule?: string
      rating?: number
      company?: string
      wasteTypes: string[]
    }
    geometry: {
      type: 'Point'
      coordinates: [number, number]
    }
  }>
}

export function responseDTOToLegacyFeatureCollection(
  dto: CollectionPointsResponseDTO,
): LegacyFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: dto.points.map(
      (point): LegacyFeatureCollection['features'][number] => ({
        type: 'Feature',
        id: point.id,
        properties: {
          id: point.id,
          latitude: point.latitude,
          longitude: point.longitude,
          slug: point.slug ?? undefined,
          type: point.type,
          families_pope: point.familiesPope,
          location_types_pope: point.locationTypesPope,
          plainTypes: point.plainTypes,
          plainFilters: point.plainFilters,
          name: point.name,
          address: point.address ?? undefined,
          phone: point.phone ?? undefined,
          schedule: point.schedule ?? undefined,
          rating: point.rating ?? undefined,
          company: point.company ?? undefined,
          wasteTypes: point.wasteTypes,
        },
        geometry: {
          type: 'Point',
          coordinates: [point.longitude, point.latitude],
        },
      }),
    ),
  }
}

export function responsePointToStableKey(point: CollectionPointResponseDTO) {
  return point.slug ?? point.id
}
