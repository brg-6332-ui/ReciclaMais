import type { CollectionPointEntity } from '../../domain/collection-point.entity'

export type ListCollectionPointsResult = {
  points: readonly CollectionPointEntity[]
}
