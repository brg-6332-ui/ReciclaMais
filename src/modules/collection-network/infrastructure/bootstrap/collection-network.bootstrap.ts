import { ListCollectionPointsUseCase } from '../../application/usecases/list-collection-points.usecase'
import { createPoiCollectionNetworkRepository } from '../persistence/poi-collection-network.repository'

export function createCollectionNetworkBootstrap() {
  const repository = createPoiCollectionNetworkRepository()
  const listCollectionPointsUseCase = new ListCollectionPointsUseCase(
    repository,
  )

  return {
    listCollectionPointsUseCase,
  }
}
