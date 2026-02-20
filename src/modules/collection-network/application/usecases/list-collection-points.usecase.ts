import type { CollectionNetworkRepository } from '../collection-network.repository'
import type { ListCollectionPointsCommand } from '../commands/list-collection-points.command'
import type { ListCollectionPointsResult } from '../results/list-collection-points.result'

export class ListCollectionPointsUseCase {
  constructor(private readonly repository: CollectionNetworkRepository) {}

  async execute(
    command: ListCollectionPointsCommand = { includeGps: true },
  ): Promise<ListCollectionPointsResult> {
    const points = await this.repository.listCollectionPoints()

    if (command.includeGps) {
      return { points }
    }

    return {
      points: points.filter((point) => point.kind !== 'gps'),
    }
  }
}
