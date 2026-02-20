import type { MaterialType } from '../../domain/material-type.vo'

export type DashboardStatsResult = {
  totalRecycled: number
  recycledThisMonth: number
  recycledThisMonthDeltaPercent: number | null
  deliveriesThisMonth: number
  totalRewards: number
  distributionPercent: Partial<Record<MaterialType, number>>
  lastRecyclingDate: string | null
}

export type DashboardActivityResult = {
  id: number
  date: string
  type: MaterialType
  amount: number
  reward: number
  location?: string
}

export type DashboardSummaryResult = {
  stats: DashboardStatsResult
  recentActivities: DashboardActivityResult[]
}
