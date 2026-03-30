import type { APIEvent } from '@solidjs/start/server'

import {
  ACTIVITY_SELECT,
  activityPayloadSchema,
  buildActivityUpdate,
  createErrorResponse,
  createJsonResponse,
  createServerSupabaseClient,
  parseActivityId,
  toActivityResponse,
  validateOccurredAt,
} from '~/routes/api/dashboard/activities.shared'

async function getAuthenticatedContext(event: APIEvent) {
  const supabase = createServerSupabaseClient(event.request)
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      supabase,
      user: null,
      response: createErrorResponse(
        401,
        'Unauthorized',
        'User not authenticated',
      ),
    }
  }

  return {
    supabase,
    user,
    response: null,
  }
}

export async function PATCH(event: APIEvent): Promise<Response> {
  try {
    const activityId = parseActivityId(event.params.id)

    if (activityId === null) {
      return createErrorResponse(400, 'Validation Error', 'Invalid activity id')
    }

    const context = await getAuthenticatedContext(event)
    if (context.response) return context.response

    const rawBody: unknown = await event.request.json()
    const parseResult = activityPayloadSchema.safeParse(rawBody)

    if (!parseResult.success) {
      return createErrorResponse(
        400,
        'Validation Error',
        'Invalid request payload',
        parseResult.error.issues,
      )
    }

    if (!validateOccurredAt(parseResult.data.occurred_at)) {
      return createErrorResponse(
        400,
        'Validation Error',
        'Activity date cannot be in the future',
      )
    }

    const { data: activity, error: updateError } = await context.supabase
      .from('activities')
      .update(buildActivityUpdate(parseResult.data))
      .eq('id', activityId)
      .eq('user_id', context.user.id)
      .select(ACTIVITY_SELECT)
      .maybeSingle()

    if (updateError) {
      console.error('Error updating activity:', updateError)
      return createErrorResponse(
        500,
        'Database Error',
        'Failed to update activity',
      )
    }

    if (!activity) {
      return createErrorResponse(404, 'Not Found', 'Activity not found')
    }

    return createJsonResponse(toActivityResponse(activity))
  } catch (error) {
    console.error('Error processing activity update:', error)

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

export async function DELETE(event: APIEvent): Promise<Response> {
  try {
    const activityId = parseActivityId(event.params.id)

    if (activityId === null) {
      return createErrorResponse(400, 'Validation Error', 'Invalid activity id')
    }

    const context = await getAuthenticatedContext(event)
    if (context.response) return context.response

    const { data: deletedActivity, error: deleteError } = await context.supabase
      .from('activities')
      .delete()
      .eq('id', activityId)
      .eq('user_id', context.user.id)
      .select('id')
      .maybeSingle()

    if (deleteError) {
      console.error('Error deleting activity:', deleteError)
      return createErrorResponse(
        500,
        'Database Error',
        'Failed to delete activity',
      )
    }

    if (!deletedActivity) {
      return createErrorResponse(404, 'Not Found', 'Activity not found')
    }

    return createJsonResponse({ success: true })
  } catch (error) {
    console.error('Error processing activity delete:', error)
    return createErrorResponse(
      500,
      'Internal Server Error',
      'An unexpected error occurred',
    )
  }
}
