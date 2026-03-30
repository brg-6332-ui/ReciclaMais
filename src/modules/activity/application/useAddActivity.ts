import { createSignal } from 'solid-js'

import { createActivity } from '~/modules/activity/application/activityApi'
import type {
  ActivityResponse,
  CreateActivityPayload,
} from '~/modules/activity/domain/activity'

/**
 * State for the add activity operation.
 */
export type AddActivityState = 'idle' | 'submitting' | 'success' | 'error'

/**
 * Error information from the add activity operation.
 */
export interface AddActivityError {
  message: string
  details?: unknown
}

/**
 * Hook for adding a new recycling activity.
 * @returns Object with execute function, state signal, error signal, and reset function
 */
export function useAddActivity() {
  const [state, setState] = createSignal<AddActivityState>('idle')
  const [error, setError] = createSignal<AddActivityError | null>(null)
  const [lastActivity, setLastActivity] = createSignal<
    ActivityResponse['activity'] | null
  >(null)

  /**
   * Executes the add activity operation.
   * @param payload - The activity data to submit
   * @returns Promise resolving to the created activity or null on error
   */
  async function execute(
    payload: CreateActivityPayload,
  ): Promise<ActivityResponse['activity'] | null> {
    setState('submitting')
    setError(null)

    try {
      const activity = await createActivity(payload)
      setLastActivity(activity)
      setState('success')
      return activity
    } catch (err) {
      console.error('Error adding activity:', err)
      setError({
        message:
          err instanceof Error ? err.message : 'An unexpected error occurred',
      })
      setState('error')
      return null
    }
  }

  /**
   * Resets the hook state to idle.
   */
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
