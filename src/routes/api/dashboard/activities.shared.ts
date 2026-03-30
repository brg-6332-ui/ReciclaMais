import { createClient } from '@supabase/supabase-js'
import z from 'zod/v4'

import {
  type ActivityResponse,
  MATERIAL_TYPES,
  type MaterialType,
} from '~/modules/activity/domain/activity'
import type { Database } from '~/shared/infrastructure/supabase/database.types'

export type ActivityInsert =
  Database['public']['Tables']['activities']['Insert']
export type ActivityRow = Database['public']['Tables']['activities']['Row']
export type ActivityUpdate =
  Database['public']['Tables']['activities']['Update']

export const ACTIVITY_SELECT =
  'id, material, grams, reward, date, location_id, observation'

export const activityPayloadSchema = z.object({
  material: z.enum(MATERIAL_TYPES),
  grams: z.number().int().positive().max(50_000_000),
  reward: z.number().nonnegative(),
  occurred_at: z.iso.datetime(),
  collection_point_id: z.string().trim().min(1).optional(),
  observation: z.string().trim().max(2000).optional().nullable(),
})

export function createServerSupabaseClient(request?: Request | null) {
  const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL as string
  const supabaseAnonKey = import.meta.env
    .VITE_PUBLIC_SUPABASE_ANON_KEY as string

  const getHeader = (name: string): string | null => {
    if (!request || !request.headers) return null

    const headers = (request as { headers?: unknown }).headers

    if (headers && typeof (headers as Headers).get === 'function') {
      try {
        return (headers as Headers).get(name) ?? null
      } catch {
        return null
      }
    }

    if (headers && typeof headers === 'object') {
      const headerMap = headers as Record<string, unknown>
      const value = headerMap[name.toLowerCase()] ?? headerMap[name]
      return typeof value === 'string' ? value : null
    }

    return null
  }

  const authHeader = getHeader('Authorization')
  const cookieHeader = getHeader('cookie')
  const headers: Record<string, string> = {}

  if (authHeader) headers.Authorization = authHeader
  if (cookieHeader) headers.Cookie = cookieHeader

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers,
    },
  })
}

export function createJsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export function createErrorResponse(
  status: number,
  error: string,
  message: string,
  details?: unknown,
): Response {
  return createJsonResponse(
    {
      error,
      message,
      ...(details === undefined ? {} : { details }),
    },
    status,
  )
}

export function normalizeObservation(
  observation?: string | null,
): string | null {
  if (observation === undefined || observation === null) {
    return null
  }

  const normalized = observation.trim()
  return normalized.length > 0 ? normalized : null
}

export function normalizeCollectionPointId(
  collectionPointId?: string,
): string | null {
  const normalized = collectionPointId?.trim() ?? ''
  return normalized.length > 0 ? normalized : null
}

export function validateOccurredAt(occurredAt: string): boolean {
  const date = new Date(occurredAt)
  const now = new Date()
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000)
  return date <= fiveMinutesFromNow
}

export function buildActivityInsert(
  userId: string,
  payload: z.infer<typeof activityPayloadSchema>,
): ActivityInsert {
  return {
    user_id: userId,
    material: payload.material,
    grams: payload.grams,
    date: payload.occurred_at,
    location_id: normalizeCollectionPointId(payload.collection_point_id),
    reward: payload.reward.toFixed(2),
    observation: normalizeObservation(payload.observation),
  }
}

export function buildActivityUpdate(
  payload: z.infer<typeof activityPayloadSchema>,
): ActivityUpdate {
  return {
    material: payload.material,
    grams: payload.grams,
    date: payload.occurred_at,
    location_id: normalizeCollectionPointId(payload.collection_point_id),
    reward: payload.reward.toFixed(2),
    observation: normalizeObservation(payload.observation),
  }
}

export function parseActivityId(rawId: string | undefined): number | null {
  if (!rawId) return null

  const parsedId = Number.parseInt(rawId, 10)
  return Number.isSafeInteger(parsedId) && parsedId > 0 ? parsedId : null
}

export function toActivityResponse(
  activity: Pick<
    ActivityRow,
    'id' | 'material' | 'grams' | 'reward' | 'date' | 'observation'
  >,
): ActivityResponse {
  return {
    activity: {
      id: activity.id,
      material: activity.material as MaterialType,
      grams: activity.grams,
      reward: Number.parseFloat(activity.reward ?? '0'),
      occurred_at: activity.date,
      observation: activity.observation ?? null,
    },
  }
}
