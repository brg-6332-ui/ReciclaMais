import type { RecyclingActivityRepository } from '../recycling-activity.repository'
import type { ListRecyclingActivitiesResult } from '../results/list-recycling-activities.result'

export class ListRecyclingActivitiesUseCase {
  constructor(private readonly repository: RecyclingActivityRepository) {}

  async execute(userId: string): Promise<ListRecyclingActivitiesResult> {
    const activities = await this.repository.listByUserId(userId)

    return {
      activities,
    }
  }
}
