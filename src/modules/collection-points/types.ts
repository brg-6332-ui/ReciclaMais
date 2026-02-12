/**
 * Represents a collection point where recyclable materials can be dropped off.
 */
export interface CollectionPoint {
  /** Unique identifier for the collection point */
  id: number
  /** Stable key shared between list and map (slug / placeId / name) */
  key: string
  /** Name of the collection point */
  name: string
  /** Company or organization operating the collection point */
  company: string
  /** Physical address */
  address: string
  /** Operating hours schedule */
  schedule: string
  /** Contact phone number */
  phone: string
  /** User rating (0-5) */
  rating: number
  /** Types of waste accepted (plastic, glass, paper, metal, etc.) */
  types: string[]
  /** Latitude of the collection point */
  lat: number
  /** Longitude of the collection point */
  lng: number
}

/**
 * Type for waste type filter values
 */
export type WasteTypeValue = string

/**
 * Configuration for waste type display
 */
export interface WasteTypeConfig {
  value: WasteTypeValue
  label: string
}
