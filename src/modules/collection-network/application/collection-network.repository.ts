import type { CollectionPointEntity } from '../domain/collection-point.entity'

export interface CollectionNetworkRepository {
  listCollectionPoints(): Promise<readonly CollectionPointEntity[]>
}
