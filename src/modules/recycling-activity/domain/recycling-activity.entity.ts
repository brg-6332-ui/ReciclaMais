import type { MaterialType } from './material-type.vo'

export type RecyclingActivityEntity = {
  id: number
  userId: string
  material: MaterialType
  grams: number
  occurredAt: string
  locationId: string | null
  reward: number
}
