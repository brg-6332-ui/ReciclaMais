// Keep backward-compatible route-local exports while moving implementation
// to shared infrastructure for better layering.

declare global {
  interface Request {
    json?: () => Promise<unknown>
  }
}

export {
  createGpsEntry as createEntry,
  getActiveGpsEntries as getActiveEntries,
  type GpsEntry,
  heartbeatGpsEntry as heartbeat,
  TTL_MS,
  updateGpsEntry as updateEntry,
} from '~/shared/infrastructure/gps-simulator/store'
