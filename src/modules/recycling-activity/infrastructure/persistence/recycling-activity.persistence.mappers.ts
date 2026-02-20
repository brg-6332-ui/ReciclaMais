import { DomainError } from '~/shared/kernel/errors'

import type { InsertRecyclingActivityRecord } from '../../application/recycling-activity.repository'
import { toMaterialType } from '../../domain/material-type.vo'
import type { RecyclingActivityEntity } from '../../domain/recycling-activity.entity'
import type {
  InsertRecyclingActivityRow,
  RecyclingActivityRow,
} from './recycling-activity.row'

export function rowToRecyclingActivityEntity(
  row: RecyclingActivityRow,
): RecyclingActivityEntity {
  const material = toMaterialType(row.material)

  return {
    id: row.id,
    userId: row.user_id,
    material,
    grams: row.grams,
    occurredAt: row.date,
    locationId: row.location_id,
    reward: Number.parseFloat(row.reward ?? '0'),
  }
}

export function insertRecordToRow(
  record: InsertRecyclingActivityRecord,
): InsertRecyclingActivityRow {
  if (!record.userId) {
    throw new DomainError(
      'Missing user id in insert record',
      'ACTIVITY_USER_ID_REQUIRED',
    )
  }

  return {
    user_id: record.userId,
    material: record.material,
    grams: record.grams,
    date: record.occurredAt,
    location_id: record.locationId,
    reward: record.reward.toFixed(2),
  }
}
