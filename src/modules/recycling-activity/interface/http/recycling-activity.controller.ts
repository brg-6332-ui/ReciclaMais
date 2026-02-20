import type { APIEvent } from '@solidjs/start/server'

import { createServerSupabaseClient } from '~/shared/infrastructure/supabase/serverSupabaseClient'
import {
  ApplicationError,
  DomainError,
  InfrastructureError,
} from '~/shared/kernel/errors'

import { createRecyclingActivityBootstrap } from '../../infrastructure/bootstrap/recycling-activity.bootstrap'
import {
  createRecyclingActivityRequestToCommand,
  createRecyclingActivityResultToResponseDTO,
  listRecyclingActivitiesResultToResponseDTO,
} from './recycling-activity.http.mappers'
import { createRecyclingActivityRequestDTOSchema } from './recycling-activity.schemas'

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function mapErrorToHttp(error: unknown): Response {
  if (error instanceof DomainError) {
    return jsonResponse({ error: error.code, message: error.message }, 422)
  }

  if (error instanceof ApplicationError) {
    const status =
      error.code === 'AUTH_REQUIRED'
        ? 401
        : error.code === 'ACTIVITY_NOT_FOUND'
          ? 404
          : 400
    return jsonResponse({ error: error.code, message: error.message }, status)
  }

  if (error instanceof InfrastructureError) {
    return jsonResponse({ error: error.code, message: error.message }, 500)
  }

  if (error instanceof SyntaxError) {
    return jsonResponse(
      {
        error: 'INVALID_JSON_BODY',
        message: 'Invalid JSON body',
      },
      400,
    )
  }

  return jsonResponse(
    {
      error: 'INTERNAL_SERVER_ERROR',
      message: error instanceof Error ? error.message : 'Unexpected error',
    },
    500,
  )
}

async function resolveAuthenticatedUserId(request: Request): Promise<string> {
  const supabase = createServerSupabaseClient(request)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new ApplicationError('User not authenticated', 'AUTH_REQUIRED')
  }

  return user.id
}

async function parseJsonBody(request: Request): Promise<unknown> {
  const requestLike = request as unknown as { json?: () => Promise<unknown> }
  if (typeof requestLike.json === 'function') {
    return await requestLike.json.call(request)
  }

  return JSON.parse(await request.text())
}

export async function postRecyclingActivityController(
  event: APIEvent,
): Promise<Response> {
  try {
    const userId = await resolveAuthenticatedUserId(event.request)
    const rawBody = await parseJsonBody(event.request)
    const parsed = createRecyclingActivityRequestDTOSchema.safeParse(rawBody)

    if (!parsed.success) {
      return jsonResponse(
        {
          error: 'VALIDATION_ERROR',
          message: 'Invalid request payload',
          details: parsed.error.issues,
        },
        400,
      )
    }

    const bootstrap = createRecyclingActivityBootstrap(event.request)
    const command = createRecyclingActivityRequestToCommand(parsed.data, userId)

    const result =
      await bootstrap.createRecyclingActivityUseCase.execute(command)

    return jsonResponse(createRecyclingActivityResultToResponseDTO(result), 201)
  } catch (error) {
    return mapErrorToHttp(error)
  }
}

export async function getRecyclingActivitiesController(
  event: APIEvent,
): Promise<Response> {
  try {
    const userId = await resolveAuthenticatedUserId(event.request)
    const bootstrap = createRecyclingActivityBootstrap(event.request)
    const result =
      await bootstrap.listRecyclingActivitiesUseCase.execute(userId)

    return jsonResponse(listRecyclingActivitiesResultToResponseDTO(result), 200)
  } catch (error) {
    return mapErrorToHttp(error)
  }
}

export async function deleteRecyclingActivityController(
  event: APIEvent,
  rawId: string | undefined,
): Promise<Response> {
  try {
    const userId = await resolveAuthenticatedUserId(event.request)
    const id = Number(rawId)

    const bootstrap = createRecyclingActivityBootstrap(event.request)
    await bootstrap.deleteRecyclingActivityUseCase.execute(id, userId)

    return jsonResponse({ ok: true }, 200)
  } catch (error) {
    return mapErrorToHttp(error)
  }
}

export async function getDashboardSummaryController(
  event: APIEvent,
): Promise<Response> {
  try {
    const userId = await resolveAuthenticatedUserId(event.request)
    const bootstrap = createRecyclingActivityBootstrap(event.request)
    const result = await bootstrap.getDashboardSummaryUseCase.execute(userId)

    return jsonResponse(result, 200)
  } catch (error) {
    return mapErrorToHttp(error)
  }
}
