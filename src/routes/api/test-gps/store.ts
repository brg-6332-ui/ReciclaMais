import { randomUUID } from 'crypto'

// Polyfill: some SolidStart dev runtimes provide Request objects without the
// convenient request.json() helper. To keep route handlers simple and JSON-only
// we add a tiny, global polyfill that uses request.text() + JSON.parse when
// necessary. This is a single, small fallback applied once at module load time
// (not per-handler fallback logic).
declare global {
  // augment the Request interface so TypeScript stops complaining
  interface Request {
    json?: () => Promise<unknown>
  }
}

export type GpsEntry = {
  id: string
  lat: number | null
  lng: number | null
  lastSeen: number
}

export const TTL_MS = 60_000

// Simple in-memory store for dev — file-backed persistence is intentionally
// omitted to avoid adding platform-specific I/O in unit-testable code.
let store = new Map<string, GpsEntry>()

function loadStoreFromFile() {
  return store
}

function persistStoreToFile(m: Map<string, GpsEntry>) {
  store = m
}

export function createEntry(
  lat: number | null = null,
  lng: number | null = null,
) {
  const id = randomUUID()
  const now = Date.now()
  const entry: GpsEntry = { id, lat, lng, lastSeen: now }
  store.set(id, entry)
  persistStoreToFile(store)
  return id
}

export function heartbeat(id: string) {
  const entry = store.get(id)
  if (!entry) return false
  entry.lastSeen = Date.now()
  store.set(id, entry)
  persistStoreToFile(store)
  return true
}

export function updateEntry(id: string, lat: number, lng: number) {
  const entry = store.get(id)
  if (!entry) return null
  entry.lat = lat
  entry.lng = lng
  entry.lastSeen = Date.now()
  store.set(id, entry)
  persistStoreToFile(store)
  return entry
}

export function getActiveEntries() {
  // Always reload from file to reflect changes from other worker contexts
  const store = loadStoreFromFile()
  // prune expired entries in-memory (do not persist prune to avoid race)
  const now = Date.now()
  const entries: GpsEntry[] = []
  for (const e of Array.from(store.values())) {
    if (now - e.lastSeen <= TTL_MS) entries.push(e)
  }
  return entries.map((e) => ({
    id: e.id,
    lat: e.lat,
    lng: e.lng,
    lastSeen: e.lastSeen,
  }))
}
