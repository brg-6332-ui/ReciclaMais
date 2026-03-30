import type { APIEvent } from '@solidjs/start/server'

import {
  ACTIVITY_SELECT,
  activityPayloadSchema,
  buildActivityInsert,
  createErrorResponse,
  createJsonResponse,
  createServerSupabaseClient,
  toActivityResponse,
  validateOccurredAt,
} from '~/routes/api/dashboard/activities.shared'

/**
 * POST /api/dashboard/activities
 * Creates a new recycling activity for the authenticated user.
 */
export async function POST(event: APIEvent): Promise<Response> {
  try {
    const request = event.request
    const supabase = createServerSupabaseClient(request)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResponse(401, 'Unauthorized', 'User not authenticated')
    }

    const rawBody: unknown = await request.json()

    const parseResult = activityPayloadSchema.safeParse(rawBody)

    if (!parseResult.success) {
      return createErrorResponse(
        400,
        'Validation Error',
        'Invalid request payload',
        parseResult.error.issues,
      )
    }

    const payload = parseResult.data

    if (!validateOccurredAt(payload.occurred_at)) {
      return createErrorResponse(
        400,
        'Validation Error',
        'Activity date cannot be in the future',
      )
    }

    const { data: activity, error: insertError } = await supabase
      .from('activities')
      .insert(buildActivityInsert(user.id, payload))
      .select(ACTIVITY_SELECT)
      .single()

    if (insertError) {
      console.error('Error inserting activity:', insertError)
      return createErrorResponse(
        500,
        'Database Error',
        'Failed to create activity',
      )
    }

    return createJsonResponse(toActivityResponse(activity), 201)
  } catch (error) {
    console.error('Error processing activity creation:', error)

    if (error instanceof SyntaxError) {
      return createErrorResponse(400, 'Parse Error', 'Invalid JSON body')
    }

    return createErrorResponse(
      500,
      'Internal Server Error',
      'An unexpected error occurred',
    )
  }
}
