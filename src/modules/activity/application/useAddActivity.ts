import { createSignal } from 'solid-js'

import type {
  ActivityResponse,
  CreateActivityPayload,
} from '~/modules/activity/domain/activity'
import { authActions } from '~/modules/auth/application/authActions'
import { useAuthState } from '~/modules/auth/application/authState'

export type AddActivityState = 'idle' | 'submitting' | 'success' | 'error'

export interface AddActivityError {
  message: string
  details?: unknown
}

export function useAddActivity() {
  const [state, setState] = createSignal<AddActivityState>('idle')
  const [error, setError] = createSignal<AddActivityError | null>(null)
  const [lastActivity, setLastActivity] = createSignal<
    ActivityResponse['activity'] | null
  >(null)

  const { authState } = useAuthState()

  async function execute(
    payload: CreateActivityPayload,
  ): Promise<ActivityResponse['activity'] | null> {
    const auth = authState()

    if (!auth.isAuthenticated) {
      setError({ message: 'User not authenticated' })
      setState('error')
      return null
    }

    setState('submitting')
    setError(null)

    try {
      const accessToken = await authActions.getCurrentAccessToken()

      if (!accessToken) {
        setError({ message: 'No valid session' })
        setState('error')
        return null
      }

      const response = await fetch('/api/recycling-activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      })

      const data = (await response.json()) as
        | ActivityResponse
        | { error: string; message: string; details?: unknown }

      if (!response.ok) {
        const errorData = data as {
          error: string
          message: string
          details?: unknown
        }
        setError({
          message: errorData.message || 'Failed to create activity',
          details: errorData.details,
        })
        setState('error')
        return null
      }

      const successData = data as ActivityResponse
      setLastActivity(successData.activity)
      setState('success')
      return successData.activity
    } catch (err) {
      setError({
        message:
          err instanceof Error ? err.message : 'An unexpected error occurred',
      })
      setState('error')
      return null
    }
  }

  function reset(): void {
    setState('idle')
    setError(null)
    setLastActivity(null)
  }

  return {
    execute,
    state,
    error,
    lastActivity,
    reset,
  }
}
