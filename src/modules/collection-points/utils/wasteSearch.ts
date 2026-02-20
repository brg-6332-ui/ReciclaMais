import type { CollectionPoint } from '../types'

/**
 * Known waste type definitions with labels and synonyms for fuzzy matching.
 * Each entry maps a canonical value to its display label and common aliases.
 */
export const WASTE_TYPE_CATALOG = [
  {
    value: 'plastic',
    label: 'Plástico',
    aliases: [
      'plastico',
      'plasticos',
      'plásticos',
      'pet',
      'embalagens',
      'embalagem',
      'garrafa',
      'garrafas',
    ],
  },
  {
    value: 'glass',
    label: 'Vidro',
    aliases: ['vidro', 'vidros', 'vidrão', 'vidrao', 'garrafão', 'garrafao'],
  },
  {
    value: 'paper',
    label: 'Papel',
    aliases: [
      'papel',
      'papeis',
      'papéis',
      'cartao',
      'cartão',
      'cartões',
      'cartoes',
      'jornal',
      'jornais',
      'revista',
      'revistas',
    ],
  },
  {
    value: 'metal',
    label: 'Metal',
    aliases: [
      'metal',
      'metais',
      'lata',
      'latas',
      'aluminio',
      'alumínio',
      'ferro',
      'aço',
      'aco',
    ],
  },
  {
    value: 'batteries',
    label: 'Pilhas',
    aliases: ['pilha', 'pilhas', 'bateria', 'baterias', 'batteries', 'battery'],
  },
  {
    value: 'electronics',
    label: 'Eletrónicos',
    aliases: [
      'eletronico',
      'eletrônico',
      'eletronicos',
      'eletrónicos',
      'eletrônicos',
      'electronico',
      'electronicos',
      'electrónicos',
      'equipamentos',
      'weee',
      'computador',
      'computadores',
      'telemovel',
      'telemóvel',
      'telemoveis',
      'telemóveis',
    ],
  },
  {
    value: 'oil',
    label: 'Óleo',
    aliases: [
      'oleo',
      'óleo',
      'oleos',
      'óleos',
      'oleo alimentar',
      'óleo alimentar',
      'gordura',
      'gorduras',
    ],
  },
  {
    value: 'clothing',
    label: 'Roupa',
    aliases: [
      'roupa',
      'roupas',
      'textil',
      'têxtil',
      'texteis',
      'têxteis',
      'vestuario',
      'vestuário',
      'sapatos',
      'calcado',
      'calçado',
    ],
  },
  {
    value: 'organic',
    label: 'Orgânico',
    aliases: [
      'organico',
      'orgânico',
      'organicos',
      'orgânicos',
      'compostagem',
      'compost',
      'bio',
      'bioresíduos',
      'bioresiduos',
    ],
  },
] as const

export type WasteTypeCatalogEntry = (typeof WASTE_TYPE_CATALOG)[number]

/**
 * Removes diacritics (accents) from a string.
 * @param str - Input string
 * @returns String without accents
 */
export function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/**
 * Normalizes a search term for comparison: lowercase, trimmed, no accents.
 * @param term - Raw search term
 * @returns Normalized string
 */
export function normalizeSearchTerm(term: string): string {
  return removeAccents(term.trim().toLowerCase())
}

/**
 * Searches the waste type catalog for entries matching the query.
 * Tries exact match first, then prefix/contains fallback.
 *
 * @param query - User search query
 * @returns Array of matching catalog entries, sorted by relevance
 */
export function searchWasteTypes(query: string): WasteTypeCatalogEntry[] {
  const normalized = normalizeSearchTerm(query)
  if (!normalized) return []

  // Exact match on value or label
  const exact = WASTE_TYPE_CATALOG.filter(
    (entry) =>
      normalizeSearchTerm(entry.label) === normalized ||
      entry.value === normalized ||
      entry.aliases.some((a) => normalizeSearchTerm(a) === normalized),
  )
  if (exact.length > 0) return [...exact]

  // Prefix match
  const prefix = WASTE_TYPE_CATALOG.filter(
    (entry) =>
      normalizeSearchTerm(entry.label).startsWith(normalized) ||
      entry.value.startsWith(normalized) ||
      entry.aliases.some((a) => normalizeSearchTerm(a).startsWith(normalized)),
  )
  if (prefix.length > 0) return [...prefix]

  // Contains match
  const contains = WASTE_TYPE_CATALOG.filter(
    (entry) =>
      normalizeSearchTerm(entry.label).includes(normalized) ||
      entry.value.includes(normalized) ||
      entry.aliases.some((a) => normalizeSearchTerm(a).includes(normalized)),
  )
  return [...contains]
}

/**
 * Resolves a waste type query to a single canonical value.
 * Returns null if no match found.
 *
 * @param query - User search query
 * @returns Canonical waste type value or null
 */
export function resolveWasteType(query: string): string | null {
  const results = searchWasteTypes(query)
  return results.length > 0 ? results[0].value : null
}

/**
 * Gets the display label for a waste type value.
 *
 * @param value - Canonical waste type value
 * @returns Human-readable label or the value itself if not found
 */
export function getWasteTypeLabel(value: string): string {
  const entry = WASTE_TYPE_CATALOG.find((e) => e.value === value)
  return entry?.label ?? value
}

/** Braga city center coordinates (fallback when geolocation unavailable) */
export const BRAGA_CENTER = { lat: 41.5518, lng: -8.4229 }

/**
 * Calculates distance between two lat/lng points using the Haversine formula.
 *
 * @param lat1 - Latitude of point 1
 * @param lng1 - Longitude of point 1
 * @param lat2 - Latitude of point 2
 * @param lng2 - Longitude of point 2
 * @returns Distance in kilometers
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Sorts collection points by proximity to a reference location.
 *
 * @param points - Array of collection points
 * @param refLat - Reference latitude
 * @param refLng - Reference longitude
 * @returns New sorted array (closest first)
 */
export function sortByProximity(
  points: CollectionPoint[],
  refLat: number,
  refLng: number,
): CollectionPoint[] {
  return [...points].sort((a, b) => {
    const distA = haversineDistance(refLat, refLng, a.lat, a.lng)
    const distB = haversineDistance(refLat, refLng, b.lat, b.lng)
    return distA - distB
  })
}
