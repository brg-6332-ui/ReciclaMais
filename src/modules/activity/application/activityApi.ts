import z from 'zod/v4'

import type {
  ActivityResponse,
  CreateActivityPayload,
  UpdateActivityPayload,
} from '~/modules/activity/domain/activity'
import { supabase } from '~/shared/infrastructure/supabase/supabase'

export class ActivityApiError extends Error {
  details?: unknown

  constructor(message: string, details?: unknown) {
    super(message)
    this.name = 'ActivityApiError'
    this.details = details
  }
}

const activityErrorSchema = z.object({
  message: z.string().optional(),
  details: z.unknown().optional(),
})

async function getAccessToken(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  let accessToken: string | null | undefined = session?.access_token

  if (
    !accessToken &&
    typeof window !== 'undefined' &&
    typeof localStorage !== 'undefined'
  ) {
    try {
      const sbKey = Object.keys(localStorage).find(
        (key) => key.startsWith('sb-') && key.endsWith('-auth-token'),
      )

      if (sbKey) {
        const raw = localStorage.getItem(sbKey)

        if (raw) {
          const parsed = z
            .object({
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
            .safeParse(JSON.parse(raw))

          if (parsed.success) {
            accessToken =
              parsed.data.currentSession?.access_token ??
              parsed.data.access_token ??
              parsed.data.session?.access_token ??
              null
          }
        }
      }
    } catch (error) {
      console.debug(
        'activityApi: failed to read token from localStorage fallback',
        error,
      )
    }
  }

  return accessToken ?? null
}

async function requestActivity<T>(
  input: string,
  init: RequestInit,
): Promise<T> {
  const accessToken = await getAccessToken()

  if (!accessToken) {
    throw new ActivityApiError('No valid session')
  }

  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${accessToken}`)

  if (init.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(input, {
    ...init,
    headers,
  })

  const data = (await response.json().catch(() => null)) as unknown

  if (!response.ok) {
    const parsedError = activityErrorSchema.safeParse(data)
    throw new ActivityApiError(
      parsedError.success
        ? parsedError.data.message || 'Failed to process activity request'
        : 'Failed to process activity request',
      parsedError.success ? parsedError.data.details : data,
    )
  }

  return data as T
}

export async function createActivity(
  payload: CreateActivityPayload,
): Promise<ActivityResponse['activity']> {
  const response = await requestActivity<ActivityResponse>(
    '/api/dashboard/activities',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  )

  return response.activity
}

export async function updateActivity(
  id: number,
  payload: UpdateActivityPayload,
): Promise<ActivityResponse['activity']> {
  const response = await requestActivity<ActivityResponse>(
    `/api/dashboard/activities/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  )

  return response.activity
}

export async function deleteActivity(id: number): Promise<void> {
  await requestActivity<{ success: boolean }>(
    `/api/dashboard/activities/${id}`,
    {
      method: 'DELETE',
    },
  )
}
