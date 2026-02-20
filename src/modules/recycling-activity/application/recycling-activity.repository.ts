import type { MaterialType } from '../domain/material-type.vo'
import type { RecyclingActivityEntity } from '../domain/recycling-activity.entity'

export type InsertRecyclingActivityRecord = {
  userId: string
  material: MaterialType
  grams: number
  occurredAt: string
  locationId: string | null
  reward: number
}

export interface RecyclingActivityRepository {
  insert(
    record: InsertRecyclingActivityRecord,
  ): Promise<RecyclingActivityEntity>
  listByUserId(userId: string): Promise<RecyclingActivityEntity[]>
  deleteById(id: number, userId: string): Promise<boolean>
}
