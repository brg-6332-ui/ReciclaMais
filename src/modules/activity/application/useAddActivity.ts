import { createSignal } from 'solid-js'
import z from 'zod/v4'

import type {
  ActivityResponse,
  CreateActivityPayload,
} from '~/modules/activity/domain/activity'
import { useAuthState } from '~/modules/auth/application/authState'
import { supabase } from '~/shared/infrastructure/supabase/supabase'

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

  const { authState } = useAuthState()

  /**
   * Executes the add activity operation.
   * @param payload - The activity data to submit
   * @returns Promise resolving to the created activity or null on error
   */
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
      // Get current session token
      const {
        data: { session },
      } = await supabase.auth.getSession()

      let accessToken: string | null | undefined = session?.access_token

      // Fallback: in some dev/browser setups session may not be returned
      // immediately by supabase.auth.getSession(). As a defensive measure
      // try to read the stored session token from localStorage (client only)
      // so the API call can still be authenticated. This keeps existing
      // behavior but helps debug cases where session isn't available yet.
      if (
        !accessToken &&
        typeof window !== 'undefined' &&
        typeof localStorage !== 'undefined'
      ) {
        try {
          const sbKey = Object.keys(localStorage).find(
            (k) => k.startsWith('sb-') && k.endsWith('-auth-token'),
          )
          if (sbKey) {
            const raw = localStorage.getItem(sbKey)
            if (raw) {
              const schema = z.object({
                currentSession: z
                  .object({
                    access_token: z.string().optional(),
                  })
                  .optional(),
                access_token: z.string().optional(),
                session: z
                  .object({
                    access_token: z.string().optional(),
                  })
                  .optional(),
              })
              const parsed = schema.safeParse(JSON.parse(raw))
              if (parsed.success) {
                const data = parsed.data
                accessToken =
                  data.currentSession?.access_token ??
                  data.access_token ??
                  data.session?.access_token ??
                  null
              } else {
                console.debug(
                  'useAddActivity: failed to parse localStorage session with schema',
                  { error: parsed.error, raw },
                )
              }
            }
          }
        } catch (err) {
          console.debug(
            'useAddActivity: failed to read token from localStorage fallback',
            err,
          )
        }
      }

      if (!accessToken) {
        setError({ message: 'No valid session' })
        setState('error')
        return null
      }

      const response = await fetch('/api/dashboard/activities', {
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
