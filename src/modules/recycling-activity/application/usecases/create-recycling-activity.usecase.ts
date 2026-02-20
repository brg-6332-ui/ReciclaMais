import { ApplicationError } from '~/shared/kernel/errors'

import { calculateRecyclingReward } from '../../domain/reward-calculator.service'
import type { CreateRecyclingActivityCommand } from '../commands/create-recycling-activity.command'
import type { RecyclingActivityRepository } from '../recycling-activity.repository'
import type { CreateRecyclingActivityResult } from '../results/create-recycling-activity.result'

function validateOccurredAt(occurredAt: string) {
  const date = new Date(occurredAt)
  const now = new Date()
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000)

  return date <= fiveMinutesFromNow
}

export class CreateRecyclingActivityUseCase {
  constructor(private readonly repository: RecyclingActivityRepository) {}

  async execute(
    command: CreateRecyclingActivityCommand,
  ): Promise<CreateRecyclingActivityResult> {
    if (!validateOccurredAt(command.occurredAt)) {
      throw new ApplicationError(
        'Activity date cannot be in the future',
        'ACTIVITY_OCCURRED_AT_IN_FUTURE',
      )
    }

    if (!Number.isInteger(command.grams) || command.grams <= 0) {
      throw new ApplicationError(
        'Activity grams must be a positive integer',
        'ACTIVITY_GRAMS_INVALID',
      )
    }

    const reward = calculateRecyclingReward(command.material, command.grams)

    const activity = await this.repository.insert({
      userId: command.userId,
      material: command.material,
      grams: command.grams,
      occurredAt: command.occurredAt,
      locationId: command.collectionPointId ?? null,
      reward,
    })

    return {
      activity,
    }
  }
}
