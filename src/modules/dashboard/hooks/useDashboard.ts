import { createEffect, createSignal, onCleanup } from 'solid-js'

import type { MaterialType } from '~/modules/activity/domain/activity'
import { useAuthState } from '~/modules/auth/application/authState'
import type {
  DashboardActivity,
  DashboardData,
  DashboardState,
  DashboardStats,
} from '~/modules/dashboard/types/dashboard'
import { supabase } from '~/shared/infrastructure/supabase/supabase'

/**
 * Default empty stats for unauthenticated or initial state.
 */
const EMPTY_STATS: DashboardStats = {
  totalRecycled: 0,
  recycledThisMonth: 0,
  recycledThisMonthDeltaPercent: null,
  deliveriesThisMonth: 0,
  totalRewards: 0,
  distributionPercent: {},
  lastRecyclingDate: null,
}

/**
 * Hook for fetching and managing dashboard data.
 * @returns Object with dashboard data, state, and reFetch function
 */
export function useDashboard() {
  const [state, setState] = createSignal<DashboardState>('idle')
  const [data, setData] = createSignal<DashboardData | null>(null)
  const [error, setError] = createSignal<Error | null>(null)

  const { authState } = useAuthState()

  let isMounted = true

  onCleanup(() => {
    isMounted = false
  })

  /**
   * Fetches dashboard data from Supabase.
   */
  async function fetchDashboardData(userId: string): Promise<void> {
    setState('loading')
    setError(null)

    try {
      // Fetch all activities for the user
      const { data: activities, error: fetchError } = await supabase
        .from('activities')
        .select('id, material, grams, reward, date, location_id')
        .eq('user_id', userId)
        .order('date', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      if (!isMounted) return

      // Calculate stats based on directly measurable data
      let totalGrams = 0
      let totalRewards = 0

      const recentActivities: DashboardActivity[] = []

      // For monthly comparisons
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const prevMonth = prev.getMonth()
      const prevYear = prev.getFullYear()

      let gramsThisMonth = 0
      let gramsPrevMonth = 0
      let deliveriesThisMonth = 0

      const distributionGrams: Partial<Record<MaterialType, number>> = {}

      for (const activity of activities) {
        const grams = activity.grams ?? 0
        const reward = parseFloat(activity.reward ?? '0')
        const material = activity.material as MaterialType

        totalGrams += grams
        totalRewards += reward

        // Distribution by material (by grams)
        distributionGrams[material] = (distributionGrams[material] ?? 0) + grams

        // Only include first 10 for recent activities
        if (recentActivities.length < 10) {
          recentActivities.push({
            id: activity.id,
            date: activity.date,
            type: material,
            amount: grams / 1000, // Convert to kg
            reward,
            location: activity.location_id || undefined,
          })
        }

        // Parse date safely
        const date = new Date(activity.date)
        if (!isNaN(date.getTime())) {
          const m = date.getMonth()
          const y = date.getFullYear()
          if (m === currentMonth && y === currentYear) {
            gramsThisMonth += grams
            deliveriesThisMonth += 1
          } else if (m === prevMonth && y === prevYear) {
            gramsPrevMonth += grams
          }
        }
      }

      // Convert distribution to percent
      const distributionPercent: Partial<Record<MaterialType, number>> = {}
      if (totalGrams > 0) {
        for (const k in distributionGrams) {
          const key = k as MaterialType
          const g = distributionGrams[key] ?? 0
          distributionPercent[key] = Math.round((g / totalGrams) * 1000) / 10 // 0.1% precision
        }
      }

      // Last recycling date: first activity in ordered list (activities ordered desc)
      const lastRecyclingDate =
        activities.length > 0 ? activities[0].date : null

      // Calculate month-over-month percent change if previous month has data
      const recycledThisMonthKg = Math.round((gramsThisMonth / 1000) * 10) / 10
      const recycledPrevMonthKg = Math.round((gramsPrevMonth / 1000) * 10) / 10
      const deltaPercent =
        recycledPrevMonthKg > 0
          ? Math.round(
              ((recycledThisMonthKg - recycledPrevMonthKg) /
                recycledPrevMonthKg) *
                1000,
            ) / 10
          : null

      const stats: DashboardStats = {
        totalRecycled: Math.round((totalGrams / 1000) * 10) / 10, // kg with 0.1 precision
        recycledThisMonth: recycledThisMonthKg,
        recycledThisMonthDeltaPercent: deltaPercent,
        deliveriesThisMonth,
        totalRewards: Math.round(totalRewards * 100) / 100,
        distributionPercent,
        lastRecyclingDate,
      }

      setData({ stats, recentActivities })

      setState('success')
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      if (!isMounted) return
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to fetch dashboard data'),
      )
      setState('error')
    }
  }

  /**
   * Re-fetches dashboard data.
   */
  function reFetch(): void {
    const auth = authState()
    if (auth.isAuthenticated) {
      void fetchDashboardData(auth.session.user.id)
    }
  }

  // Auto-fetch when auth state changes
  createEffect(() => {
    const auth = authState()

    if (auth.isAuthenticated) {
      void fetchDashboardData(auth.session.user.id)
    } else {
      setData(null)
      setState('idle')
    }
  })

  return {
    state,
    data,
    error,
    reFetch,
    stats: () => data()?.stats ?? EMPTY_STATS,
    recentActivities: () => data()?.recentActivities ?? [],
  }
}
