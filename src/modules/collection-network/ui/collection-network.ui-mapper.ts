import { responsePointToStableKey } from '../interface/http/collection-network.http.mappers'
import type { CollectionPointsResponseDTO } from '../interface/http/collection-network.responses'
import type { CollectionPointVM } from './collection-point.vm'

export function responseDTOToCollectionPointVMs(
  dto: CollectionPointsResponseDTO,
): CollectionPointVM[] {
  return dto.points
    .filter((point) => point.kind !== 'gps')
    .map((point, index) => ({
      id: index + 1,
      key: responsePointToStableKey(point),
      name: point.name,
      company: point.company ?? '',
      address: point.address ?? '',
      schedule: point.schedule ?? '',
      phone: point.phone ?? '',
      rating: point.rating ?? 4,
      types: point.wasteTypes,
      lat: point.latitude,
      lng: point.longitude,
    }))
}
