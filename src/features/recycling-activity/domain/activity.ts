import {
  MATERIAL_TYPES,
  type MaterialType,
} from '~/modules/recycling-activity/domain/material-type.vo'

export { MATERIAL_TYPES, type MaterialType }

export const REWARD_RATES: Record<MaterialType, number> = {
  plastic: 0.0004,
  glass: 0.000375,
  paper: 0.0004,
  metal: 0.0005,
}

export interface Activity {
  id: number
  user_id: string
  material: string
  grams: number
  location_id: string | null
  date: string
  reward: string | null
  __type?: 'Activity'
}

export type NewActivity = Omit<Activity, 'id'>

export interface CreateActivityPayload {
  material: MaterialType
  grams: number
  occurred_at: string
  collection_point_id?: string
}

export interface ActivityResponse {
  activity: {
    id: number
    material: string
    grams: number
    reward: number
    occurred_at: string
    collection_point_name?: string
  }
}
