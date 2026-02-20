import { Accessor, createMemo } from 'solid-js'

import type { CollectionPoint } from '../types'

/**
 * Hook for filtering collection points by waste type.
 * @param points - Array of collection points to filter
 * @param selectedType - Signal accessor for the currently selected waste type
 * @returns Memoized filtered array of collection points
 */
export function useCollectionPointsFilter(
  points: Accessor<CollectionPoint[]>,
  selectedType: Accessor<string>,
) {
  const filteredPoints = createMemo(() => {
    const pts = points() || []
    const type = selectedType()
    if (type === 'all') {
      return pts
    }
    return pts.filter((point) => point.types.includes(type))
  })

  return filteredPoints
}
