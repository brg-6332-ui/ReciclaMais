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

export function responsePointToStableKey(point: CollectionPointResponseDTO) {
  return point.slug ?? point.id
}
