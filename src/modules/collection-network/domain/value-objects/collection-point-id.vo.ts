import { DomainError } from '~/shared/kernel/errors'
import type { Branded } from '~/shared/kernel/types'

export type CollectionPointId = Branded<string, 'CollectionPointId'>

export function toCollectionPointId(input: unknown): CollectionPointId {
  if (typeof input !== 'string' || input.trim().length === 0) {
    throw new DomainError(
      'Invalid CollectionPointId',
      'INVALID_COLLECTION_POINT_ID',
    )
  }

  return input as CollectionPointId
}
