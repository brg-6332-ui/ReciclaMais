import { createEffect, createSignal } from 'solid-js'

import type {
  DashboardData,
  DashboardState,
  DashboardStats,
} from '~/features/dashboard/types/dashboard'
import { authActions } from '~/features/identity-access/application/authActions'
import { useAuthState } from '~/features/identity-access/application/authState'

const EMPTY_STATS: DashboardStats = {
  totalRecycled: 0,
  recycledThisMonth: 0,
  recycledThisMonthDeltaPercent: null,
  deliveriesThisMonth: 0,
  totalRewards: 0,
  distributionPercent: {},
  lastRecyclingDate: null,
}

async function getAuthorizationHeader() {
  const accessToken = await authActions.getCurrentAccessToken()
  if (!accessToken) {
    throw new Error('No valid session token')
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  }
}

export function useDashboard() {
  const [state, setState] = createSignal<DashboardState>('idle')
  const [data, setData] = createSignal<DashboardData | null>(null)
  const [error, setError] = createSignal<Error | null>(null)

  const { authState } = useAuthState()

  async function fetchDashboardData(): Promise<void> {
    setState('loading')
    setError(null)

    try {
      const headers = await getAuthorizationHeader()

      const response = await fetch('/api/dashboard-summary', {
        method: 'GET',
        headers,
      })

      const payload = (await response.json()) as
        | DashboardData
        | { error: string; message: string }

      if (!response.ok) {
        const apiError = payload as { error: string; message: string }
        throw new Error(apiError.message || 'Failed to fetch dashboard summary')
      }

      setData(payload as DashboardData)
      setState('success')
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to fetch dashboard data'),
      )
      setState('error')
    }
  }

  async function removeActivity(id: number): Promise<void> {
    const headers = await getAuthorizationHeader()

    const response = await fetch(`/api/recycling-activities/${id}`, {
      method: 'DELETE',
      headers,
    })

    const payload = (await response.json()) as {
      error?: string
      message?: string
    }

    if (!response.ok) {
      throw new Error(payload.message || 'Failed to delete activity')
    }

    await fetchDashboardData()
  }

  function reFetch(): void {
    const auth = authState()
    if (auth.isAuthenticated) {
      void fetchDashboardData()
    }
  }

  createEffect(() => {
    const auth = authState()

    if (auth.isAuthenticated) {
      void fetchDashboardData()
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
    removeActivity,
    stats: () => data()?.stats ?? EMPTY_STATS,
    recentActivities: () => data()?.recentActivities ?? [],
  }
}
