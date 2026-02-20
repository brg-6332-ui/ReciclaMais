import { randomUUID } from 'crypto'

export type GpsEntry = {
  id: string
  lat: number | null
  lng: number | null
  lastSeen: number
}

export const TTL_MS = 60_000

let store = new Map<string, GpsEntry>()

function loadStore() {
  return store
}

function persistStore(next: Map<string, GpsEntry>) {
  store = next
}

export function createGpsEntry(
  lat: number | null = null,
  lng: number | null = null,
) {
  const id = randomUUID()
  const now = Date.now()
  const entry: GpsEntry = { id, lat, lng, lastSeen: now }
  store.set(id, entry)
  persistStore(store)
  return id
}

export function heartbeatGpsEntry(id: string) {
  const entry = store.get(id)
  if (!entry) return false
  entry.lastSeen = Date.now()
  store.set(id, entry)
  persistStore(store)
  return true
}

export function updateGpsEntry(id: string, lat: number, lng: number) {
  const entry = store.get(id)
  if (!entry) return null
  entry.lat = lat
  entry.lng = lng
  entry.lastSeen = Date.now()
  store.set(id, entry)
  persistStore(store)
  return entry
}

export function getActiveGpsEntries() {
  const loadedStore = loadStore()
  const now = Date.now()
  const entries: GpsEntry[] = []

  for (const entry of Array.from(loadedStore.values())) {
    if (now - entry.lastSeen <= TTL_MS) entries.push(entry)
  }

  return entries.map((entry) => ({
    id: entry.id,
    lat: entry.lat,
    lng: entry.lng,
    lastSeen: entry.lastSeen,
  }))
}
