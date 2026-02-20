import { getCollectionPointsController } from '~/modules/collection-network/interface/http/collection-network.controller'

export async function GET() {
  return await getCollectionPointsController()
}
