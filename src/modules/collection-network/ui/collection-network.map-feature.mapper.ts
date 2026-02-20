import type { FeatureCollection, Point } from 'geojson'

import type { POIBasic } from '~/modules/map/hooks/usePOI'

import type { CollectionPointsResponseDTO } from '../interface/http/collection-network.responses'

export function responseDTOToMapFeatureCollection(
  dto: CollectionPointsResponseDTO,
): FeatureCollection<Point, POIBasic> {
  return {
    type: 'FeatureCollection',
    features: dto.points.map((point) => ({
      type: 'Feature',
      id: point.id,
      properties: {
        id: point.id,
        latitude: point.latitude,
        longitude: point.longitude,
        slug: point.slug ?? point.id,
        type: point.type,
        families_pope: point.familiesPope,
        location_types_pope: point.locationTypesPope,
        wasteTypes: point.wasteTypes,
        plainTypes: point.plainTypes,
        plainFilters: point.plainFilters,
      },
      geometry: {
        type: 'Point',
        coordinates: [point.longitude, point.latitude],
      },
    })),
  }
}
