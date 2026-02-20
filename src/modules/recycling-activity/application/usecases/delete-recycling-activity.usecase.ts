import { ApplicationError } from '~/shared/kernel/errors'

import type { RecyclingActivityRepository } from '../recycling-activity.repository'

export class DeleteRecyclingActivityUseCase {
  constructor(private readonly repository: RecyclingActivityRepository) {}

  async execute(id: number, userId: string): Promise<void> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ApplicationError('Invalid activity id', 'ACTIVITY_ID_INVALID')
    }

    const deleted = await this.repository.deleteById(id, userId)
    if (!deleted) {
      throw new ApplicationError('Activity not found', 'ACTIVITY_NOT_FOUND')
    }
  }
}
