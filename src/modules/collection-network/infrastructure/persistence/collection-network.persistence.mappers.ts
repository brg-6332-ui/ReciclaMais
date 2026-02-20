import type { GpsEntry } from '~/shared/infrastructure/gps-simulator/store'

import type { CollectionPointEntity } from '../../domain/collection-point.entity'
import { toCollectionPointId } from '../../domain/value-objects/collection-point-id.vo'
import type { CollectionPointRow } from './collection-point.row'

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }

  return null
}

function toStringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null
}

function toSlugList(value: unknown): Array<{ slug: string }> {
  if (!Array.isArray(value)) return []

  return value
    .filter((entry) => typeof entry === 'object' && entry !== null)
    .map((entry) => {
      const slug =
        typeof (entry as Record<string, unknown>).slug === 'string'
          ? ((entry as Record<string, unknown>).slug as string)
          : ''

      return { slug }
    })
    .filter((entry) => entry.slug.length > 0)
}

function toStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((entry): entry is string => typeof entry === 'string')
}

export function rowToCollectionPointEntity(
  row: CollectionPointRow,
): CollectionPointEntity | null {
  const latitude = toNumber(row.latitude)
  const longitude = toNumber(row.longitude)

  if (latitude === null || longitude === null) {
    return null
  }

  const rawId = String(row.id ?? row.slug ?? `${latitude}-${longitude}`)
  const name =
    toStringOrNull(row.name) ??
    toStringOrNull(row.slug) ??
    `Ponto ${rawId.slice(0, 6)}`

  const sourceType = toStringOrNull(row.type) ?? 'collection-point'
  const kind = sourceType === 'gps' ? 'gps' : 'collection-point'

  return {
    id: toCollectionPointId(rawId),
    slug: toStringOrNull(row.slug),
    kind,
    sourceType,
    latitude,
    longitude,
    name,
    address: toStringOrNull(row.address),
    phone: toStringOrNull(row.phone),
    schedule: toStringOrNull(row.schedule),
    rating: toNumber(row.rating),
    company: toStringOrNull(row.company),
    wasteTypes: toStringList(row.wasteTypes),
    familiesPope: toSlugList(row.families_pope),
    locationTypesPope: toSlugList(row.location_types_pope),
    plainTypes: toStringOrNull(row.plainTypes) ?? '',
    plainFilters: toStringOrNull(row.plainFilters) ?? '',
  }
}

export function gpsEntryToCollectionPointEntity(
  entry: GpsEntry,
): CollectionPointEntity | null {
  if (entry.lat === null || entry.lng === null) {
    return null
  }

  return {
    id: toCollectionPointId(`gps-${entry.id}`),
    slug: 'dynamic-gps-entry',
    kind: 'gps',
    sourceType: 'gps',
    latitude: entry.lat,
    longitude: entry.lng,
    name: 'Ponto em Tempo Real',
    address: null,
    phone: null,
    schedule: null,
    rating: null,
    company: null,
    wasteTypes: [],
    familiesPope: [],
    locationTypesPope: [],
    plainTypes: '',
    plainFilters: '',
  }
}
