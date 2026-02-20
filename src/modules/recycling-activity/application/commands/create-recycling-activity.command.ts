import type { MaterialType } from '../../domain/material-type.vo'

export type CreateRecyclingActivityCommand = {
  userId: string
  material: MaterialType
  grams: number
  occurredAt: string
  collectionPointId?: string
}
