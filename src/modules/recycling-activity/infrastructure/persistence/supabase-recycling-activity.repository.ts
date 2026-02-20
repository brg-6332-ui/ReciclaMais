import { createServerSupabaseClient } from '~/shared/infrastructure/supabase/serverSupabaseClient'
import { InfrastructureError } from '~/shared/kernel/errors'

import type {
  InsertRecyclingActivityRecord,
  RecyclingActivityRepository,
} from '../../application/recycling-activity.repository'
import type { RecyclingActivityEntity } from '../../domain/recycling-activity.entity'
import {
  insertRecordToRow,
  rowToRecyclingActivityEntity,
} from './recycling-activity.persistence.mappers'
import type { RecyclingActivityRow } from './recycling-activity.row'

export function createSupabaseRecyclingActivityRepository(
  request: Request,
): RecyclingActivityRepository {
  const supabase = createServerSupabaseClient(request)

  return {
    async insert(
      record: InsertRecyclingActivityRecord,
    ): Promise<RecyclingActivityEntity> {
      const insertRow = insertRecordToRow(record)

      const { data, error } = await supabase
        .from('activities')
        .insert(insertRow)
        .select('id, user_id, material, grams, date, location_id, reward')
        .single()

      if (error || !data) {
        throw new InfrastructureError(
          error?.message ?? 'Could not create activity',
          'ACTIVITY_INSERT_FAILED',
          error,
        )
      }

      return rowToRecyclingActivityEntity(data as RecyclingActivityRow)
    },

    async listByUserId(userId: string): Promise<RecyclingActivityEntity[]> {
      const { data, error } = await supabase
        .from('activities')
        .select('id, user_id, material, grams, date, location_id, reward')
        .eq('user_id', userId)
        .order('date', { ascending: false })

      if (error) {
        throw new InfrastructureError(
          error.message,
          'ACTIVITY_LIST_FAILED',
          error,
        )
      }

      return (data ?? []).map((row) =>
        rowToRecyclingActivityEntity(row as RecyclingActivityRow),
      )
    },

    async deleteById(id: number, userId: string): Promise<boolean> {
      const { data, error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
        .select('id')

      if (error) {
        throw new InfrastructureError(
          error.message,
          'ACTIVITY_DELETE_FAILED',
          error,
        )
      }

      return Array.isArray(data) && data.length > 0
    },
  }
}
