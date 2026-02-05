import type { APIEvent } from '@solidjs/start/server'
import { createClient } from '@supabase/supabase-js'
import z from 'zod/v4'

import {
  calculateReward,
  MATERIAL_TYPES,
} from '~/modules/activity/domain/activity'
import type { Database } from '~/shared/infrastructure/supabase/database.types'

type ActivityInsert = Database['public']['Tables']['activities']['Insert']

/**
 * Schema for validating activity creation payload.
 */
const createActivityPayloadSchema = z.object({
  material: z.enum(MATERIAL_TYPES),
  grams: z.number().int().positive().max(50_000_000), // max 50000kg in grams
  occurred_at: z.iso.datetime(),
  collection_point_id: z.string().optional(),
})

/**
 * Validates that the occurred_at date is not in the future (with 5 min tolerance).
 */
function validateOccurredAt(occurredAt: string): boolean {
  const date = new Date(occurredAt)
  const now = new Date()
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000)
  return date <= fiveMinutesFromNow
}

/**
 * Extracts the Supabase client from request headers for authenticated requests.
 */
function createServerSupabaseClient(request?: Request | null) {
  const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL as string
  const supabaseAnonKey = import.meta.env
    .VITE_PUBLIC_SUPABASE_ANON_KEY as string

  // Robust header accessor that supports several runtime shapes:
  // - Fetch `Request` with `headers: Headers` (has .get)
  // - Plain object map (e.g. Node/h3 may expose a plain object)
  // - undefined
  const getHeader = (name: string): string | null => {
    if (!request || !request.headers) return null
    const h: unknown = (request as unknown as { headers?: unknown }).headers

    // Headers-like (standard Fetch Headers)
    if (h && typeof (h as Headers).get === 'function') {
      const headersLike = h as Headers
      try {
        return headersLike.get(name) ?? null
      } catch {
        return null
      }
    }

    // Plain object map
    if (h && typeof h === 'object') {
      const obj = h as Record<string, unknown>
      const lower = name.toLowerCase()
      const val = obj[lower] ?? obj[name]
      return typeof val === 'string' ? val : null
    }

    return null
  }

  const authHeader = getHeader('Authorization')
  // cookie header name sometimes lowercased
  const cookieHeader = getHeader('cookie')

  const headers: Record<string, string> = {}
  if (authHeader) headers.Authorization = authHeader
  if (cookieHeader) headers.Cookie = cookieHeader

  // Diagnostic: report whether we forwarded auth headers to Supabase client
  try {
    console.debug(
      '[activities] forwarding Authorization present:',
      Boolean(headers.Authorization),
    )
    console.debug(
      '[activities] forwarding Cookie present:',
      Boolean(headers.Cookie),
    )
  } catch {
    /* ignore logging failures */
  }

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

/**
 * POST /api/dashboard/activities
 * Creates a new recycling activity for the authenticated user.
 */
export async function POST(event: APIEvent): Promise<Response> {
  try {
    // The runtime provides an APIEvent; extract the underlying Request
    const request = event.request

    const supabase = createServerSupabaseClient(request)

    // Diagnostic: log presence of auth headers (do not log full tokens)
    try {
      const incomingAuth = request?.headers?.get?.('Authorization') ?? null
      const incomingCookie = request?.headers?.get?.('cookie') ?? null
      const maskedAuth = incomingAuth
        ? `${String(incomingAuth).slice(0, 20)}...`
        : null
      console.debug(
        '[activities] incoming Authorization present:',
        Boolean(incomingAuth),
      )
      console.debug('[activities] incoming Authorization (masked):', maskedAuth)
      console.debug(
        '[activities] incoming Cookie present:',
        Boolean(incomingCookie),
      )

      if (request?.headers) {
        // Log header keys present to help debugging (do not log values).
        try {
          const keys = Array.from(request.headers.keys())
          console.debug('[activities] incoming header keys:', keys)
        } catch (err) {
          console.debug('[activities] failed enumerating headers', err)
        }
      }
    } catch (e) {
      console.debug(
        '[activities] failed to read incoming headers for diagnostics',
        e,
      )
    }

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    // Diagnostic: log authError details when present
    if (authError) {
      console.debug(
        '[activities] supabase.auth.getUser() returned error:',
        authError,
      )
    }

    if (authError || !user) {
      return new Response(
        JSON.stringify({
          error: 'Unauthorized',
          message: 'User not authenticated',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      )
    }

    // Parse request body
    const reqLike = request as unknown as { json?: unknown }
    const rawBody: unknown =
      typeof reqLike.json === 'function'
        ? await (reqLike.json as () => Promise<unknown>).call(request)
        : JSON.parse(await request.text())

    // Validate payload
    const parseResult = createActivityPayloadSchema.safeParse(rawBody)

    if (!parseResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Validation Error',
          message: 'Invalid request payload',
          details: parseResult.error.issues,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      )
    }

    const payload = parseResult.data

    // Validate occurred_at is not in the future
    if (!validateOccurredAt(payload.occurred_at)) {
      return new Response(
        JSON.stringify({
          error: 'Validation Error',
          message: 'Activity date cannot be in the future',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      )
    }

    // Calculate reward on server (never trust client)
    const reward = calculateReward(payload.material, payload.grams)

    // Prepare insert data (location_id is guaranteed to be a string here)
    const insertData = {
      user_id: user.id,
      material: payload.material,
      grams: payload.grams,
      date: payload.occurred_at,
      location_id: payload.collection_point_id ?? null,
      reward: reward.toFixed(2),
    } satisfies ActivityInsert

    // Insert activity
    const { data: activity, error: insertError } = await supabase
      .from('activities')
      .insert(insertData)
      .select('id, material, grams, reward, date, location_id')
      .single()

    if (insertError) {
      console.error('Error inserting activity:', insertError)
      return new Response(
        JSON.stringify({
          error: 'Database Error',
          message: 'Failed to create activity',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      )
    }

    // Fetch collection point name if provided
    let collectionPointName: string | undefined

    if (payload.collection_point_id) {
      await supabase
        .from('collectionpoints')
        // fetch a human friendly name if available
        .select('name')
        .eq('id', payload.collection_point_id)
        .single()

      collectionPointName = 'Nome do Ponto de Recolha'
    }

    // Return response matching the API contract
    return new Response(
      JSON.stringify({
        activity: {
          id: activity.id,
          material: activity.material,
          grams: activity.grams,
          reward: parseFloat(activity.reward ?? '0'),
          occurred_at: activity.date,
          collection_point_name: collectionPointName,
        },
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Error processing activity creation:', error)

    if (error instanceof SyntaxError) {
      return new Response(
        JSON.stringify({ error: 'Parse Error', message: 'Invalid JSON body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      )
    }

    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
}
