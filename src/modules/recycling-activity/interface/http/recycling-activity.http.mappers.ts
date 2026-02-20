import type { CreateRecyclingActivityCommand } from '../../application/commands/create-recycling-activity.command'
import type { CreateRecyclingActivityResult } from '../../application/results/create-recycling-activity.result'
import type { ListRecyclingActivitiesResult } from '../../application/results/list-recycling-activities.result'
import type {
  CreateRecyclingActivityResponseDTO,
  ListRecyclingActivitiesResponseDTO,
} from './recycling-activity.responses'
import type { CreateRecyclingActivityRequestDTO } from './recycling-activity.schemas'

export function createRecyclingActivityRequestToCommand(
  requestDTO: CreateRecyclingActivityRequestDTO,
  userId: string,
): CreateRecyclingActivityCommand {
  return {
    userId,
    material: requestDTO.material,
    grams: requestDTO.grams,
    occurredAt: requestDTO.occurred_at,
    collectionPointId: requestDTO.collection_point_id,
  }
}

export function createRecyclingActivityResultToResponseDTO(
  result: CreateRecyclingActivityResult,
): CreateRecyclingActivityResponseDTO {
  return {
    activity: {
      id: result.activity.id,
      material: result.activity.material,
      grams: result.activity.grams,
      reward: result.activity.reward,
      occurred_at: result.activity.occurredAt,
      collection_point_name: undefined,
    },
  }
}

export function listRecyclingActivitiesResultToResponseDTO(
  result: ListRecyclingActivitiesResult,
): ListRecyclingActivitiesResponseDTO {
  return {
    activities: result.activities.map((activity) => ({
      id: activity.id,
      material: activity.material,
      grams: activity.grams,
      reward: activity.reward,
      occurred_at: activity.occurredAt,
      collection_point_name: undefined,
    })),
  }
}
