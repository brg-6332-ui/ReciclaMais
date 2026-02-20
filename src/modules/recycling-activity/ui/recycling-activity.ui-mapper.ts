import type { RecyclingActivityResponseDTO } from '../interface/http/recycling-activity.responses'
import type { RecyclingActivityVM } from './recycling-activity.vm'

function toRecyclingMaterialVM(input: string): RecyclingActivityVM['type'] {
  if (
    input === 'plastic' ||
    input === 'glass' ||
    input === 'paper' ||
    input === 'metal'
  ) {
    return input
  }

  return 'plastic'
}

export function activityResponseToVM(
  dto: RecyclingActivityResponseDTO,
): RecyclingActivityVM {
  return {
    id: dto.id,
    date: dto.occurred_at,
    type: toRecyclingMaterialVM(dto.material),
    amount: dto.grams / 1000,
    reward: dto.reward,
    location: dto.collection_point_name,
  }
}
