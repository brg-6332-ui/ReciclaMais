import type { MaterialType } from '~/features/recycling-activity/domain/activity'

/**
 * User statistics for the dashboard.
 *
 * Only include metrics that are directly measurable by the system.
 */
export interface DashboardStats {
  /** Total historical recycled weight in kg */
  totalRecycled: number
  /** Recycled weight in the current calendar month (kg) */
  recycledThisMonth: number
  /** Percent change vs previous month, or null when not applicable */
  recycledThisMonthDeltaPercent: number | null
  /** Number of recycling deliveries in the current month */
  deliveriesThisMonth: number
  /** Total rewards accumulated in euros */
  totalRewards: number
  /** Distribution of recycled materials as percentages (sum ~= 100) */
  distributionPercent: Partial<Record<MaterialType, number>>
  /** ISO date string of the most recent recycling activity, if any */
  lastRecyclingDate?: string | null
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
