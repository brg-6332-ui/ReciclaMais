import type { MaterialType } from '~/modules/activity/domain/activity'

/**
 * User statistics for the dashboard.
 */
export interface DashboardStats {
  totalRecycled: number // in kg
  totalRewards: number // in euros
  co2Saved: number // in kg
  recyclingRate: number // percentage
}

/**
 * Recent activity item for the dashboard.
 */
export interface DashboardActivity {
  id: number
  date: string
  type: MaterialType
  amount: number // in kg
  reward: number // in euros
  location?: string
}

/**
 * Dashboard data structure.
 */
export interface DashboardData {
  stats: DashboardStats
  recentActivities: DashboardActivity[]
}

/**
 * Dashboard loading state.
 */
export type DashboardState = 'idle' | 'loading' | 'success' | 'error'
