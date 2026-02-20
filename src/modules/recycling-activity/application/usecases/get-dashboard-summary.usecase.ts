import type { MaterialType } from '../../domain/material-type.vo'
import type { RecyclingActivityRepository } from '../recycling-activity.repository'
import type { DashboardSummaryResult } from '../results/dashboard-summary.result'

export class GetDashboardSummaryUseCase {
  constructor(private readonly repository: RecyclingActivityRepository) {}

  async execute(userId: string): Promise<DashboardSummaryResult> {
    const activities = await this.repository.listByUserId(userId)

    let totalGrams = 0
    let totalRewards = 0

    const recentActivities: DashboardSummaryResult['recentActivities'] = []

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const previousReference = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const previousMonth = previousReference.getMonth()
    const previousYear = previousReference.getFullYear()

    let gramsThisMonth = 0
    let gramsPreviousMonth = 0
    let deliveriesThisMonth = 0

    const distributionGrams: Partial<Record<MaterialType, number>> = {}

    for (const activity of activities) {
      totalGrams += activity.grams
      totalRewards += activity.reward

      distributionGrams[activity.material] =
        (distributionGrams[activity.material] ?? 0) + activity.grams

      if (recentActivities.length < 10) {
        recentActivities.push({
          id: activity.id,
          date: activity.occurredAt,
          type: activity.material,
          amount: activity.grams / 1000,
          reward: activity.reward,
          location: activity.locationId ?? undefined,
        })
      }

      const activityDate = new Date(activity.occurredAt)
      if (Number.isNaN(activityDate.getTime())) {
        continue
      }

      const month = activityDate.getMonth()
      const year = activityDate.getFullYear()

      if (month === currentMonth && year === currentYear) {
        gramsThisMonth += activity.grams
        deliveriesThisMonth += 1
      } else if (month === previousMonth && year === previousYear) {
        gramsPreviousMonth += activity.grams
      }
    }

    const distributionPercent: Partial<Record<MaterialType, number>> = {}
    if (totalGrams > 0) {
      for (const key of Object.keys(distributionGrams) as MaterialType[]) {
        const grams = distributionGrams[key] ?? 0
        distributionPercent[key] = Math.round((grams / totalGrams) * 1000) / 10
      }
    }

    const recycledThisMonth = Math.round((gramsThisMonth / 1000) * 10) / 10
    const recycledPreviousMonth =
      Math.round((gramsPreviousMonth / 1000) * 10) / 10

    const recycledThisMonthDeltaPercent =
      recycledPreviousMonth > 0
        ? Math.round(
            ((recycledThisMonth - recycledPreviousMonth) /
              recycledPreviousMonth) *
              1000,
          ) / 10
        : null

    return {
      stats: {
        totalRecycled: Math.round((totalGrams / 1000) * 10) / 10,
        recycledThisMonth,
        recycledThisMonthDeltaPercent,
        deliveriesThisMonth,
        totalRewards: Math.round(totalRewards * 100) / 100,
        distributionPercent,
        lastRecyclingDate: activities[0]?.occurredAt ?? null,
      },
      recentActivities,
    }
  }
}
