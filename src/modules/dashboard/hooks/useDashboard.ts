import { createEffect, createSignal, onCleanup } from 'solid-js'

import {
  CO2_RATES,
  type MaterialType,
} from '~/modules/activity/domain/activity'
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
  totalRewards: 0,
  co2Saved: 0,
  recyclingRate: 0,
}

/**
 * Calculates CO2 saved based on material and grams.
 */
function calculateCO2Saved(material: string, grams: number): number {
  const rate = CO2_RATES[material as MaterialType] ?? 0
  return grams * rate
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

      // Calculate stats
      let totalGrams = 0
      let totalRewards = 0
      let totalCO2 = 0

      const recentActivities: DashboardActivity[] = []

      for (const activity of activities) {
        const grams = activity.grams ?? 0
        const reward = parseFloat(activity.reward ?? '0')
        const material = activity.material as MaterialType

        totalGrams += grams
        totalRewards += reward
        totalCO2 += calculateCO2Saved(material, grams)

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
      }

      // Calculate recycling rate (mock: based on activity frequency)
      const recyclingRate =
        activities.length > 0 ? Math.min(100, activities.length * 10) : 0

      const stats: DashboardStats = {
        totalRecycled: Math.round(totalGrams / 10) / 100, // Convert to kg with 2 decimals
        totalRewards: Math.round(totalRewards * 100) / 100,
        co2Saved: Math.round(totalCO2 / 10) / 100, // Convert to kg with 2 decimals
        recyclingRate,
      }

      setData({
        stats,
        recentActivities,
      })

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
