/**
 * Represents a collection point where recyclable materials can be dropped off.
 */
export interface CollectionPoint {
  /** Unique identifier for the collection point */
  id: number
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
