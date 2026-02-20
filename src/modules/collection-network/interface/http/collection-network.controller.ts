import { ApplicationError, InfrastructureError } from '~/shared/kernel/errors'

import { createCollectionNetworkBootstrap } from '../../infrastructure/bootstrap/collection-network.bootstrap'
import { listCollectionPointsResultToResponseDTO } from './collection-network.http.mappers'
import { CollectionPointsResponseDTOSchema } from './collection-network.schemas'

const bootstrap = createCollectionNetworkBootstrap()

function toJsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function mapCollectionNetworkErrorToHttp(error: unknown): Response {
  if (error instanceof ApplicationError) {
    return toJsonResponse({ error: error.code, message: error.message }, 400)
  }

  if (error instanceof InfrastructureError) {
    return toJsonResponse({ error: error.code, message: error.message }, 503)
  }

  return toJsonResponse(
    {
      error: 'INTERNAL_SERVER_ERROR',
      message: error instanceof Error ? error.message : 'Unexpected error',
    },
    500,
  )
}

export async function getCollectionPointsController(): Promise<Response> {
  try {
    const result = await bootstrap.listCollectionPointsUseCase.execute({
      includeGps: true,
    })

    const dto = listCollectionPointsResultToResponseDTO(result)
    const parsed = CollectionPointsResponseDTOSchema.safeParse(dto)

    if (!parsed.success) {
      throw new InfrastructureError(
        'Invalid collection points response payload',
        'COLLECTION_POINTS_RESPONSE_VALIDATION_FAILED',
        parsed.error,
      )
    }

    return toJsonResponse(parsed.data)
  } catch (error) {
    return mapCollectionNetworkErrorToHttp(error)
  }
}
