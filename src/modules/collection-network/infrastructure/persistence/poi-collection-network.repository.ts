import * as POI from '~/poi.json'
import { getActiveGpsEntries } from '~/shared/infrastructure/gps-simulator/store'

import type { CollectionNetworkRepository } from '../../application/collection-network.repository'
import type { CollectionPointEntity } from '../../domain/collection-point.entity'
import {
  gpsEntryToCollectionPointEntity,
  rowToCollectionPointEntity,
} from './collection-network.persistence.mappers'
import type { CollectionPointsPoiFile } from './collection-point.row'

export function createPoiCollectionNetworkRepository(): CollectionNetworkRepository {
  return {
    listCollectionPoints(): Promise<readonly CollectionPointEntity[]> {
      const file = POI as unknown as CollectionPointsPoiFile
      const staticRows = file.data.publicGetMapInformation.points ?? []

      const staticEntities = staticRows
        .map((row) => rowToCollectionPointEntity(row))
        .filter((entity): entity is CollectionPointEntity => entity !== null)

      const gpsEntities = getActiveGpsEntries()
        .map((entry) => gpsEntryToCollectionPointEntity(entry))
        .filter((entity): entity is CollectionPointEntity => entity !== null)

      return Promise.resolve([...staticEntities, ...gpsEntities])
    },
  }
}
