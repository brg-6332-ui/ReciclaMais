import { Accessor, For } from 'solid-js'

import type { CollectionPoint } from '../types'
import { CollectionPointCard } from './CollectionPointCard'

interface CollectionPointsListProps {
  points: Accessor<CollectionPoint[]>
}

/**
 * Grid list component displaying multiple collection point cards.
 * Responsive grid layout that adapts from 1 to 3 columns.
 */
export function CollectionPointsList(props: CollectionPointsListProps) {
  return (
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <For each={props.points()}>
        {(point) => <CollectionPointCard point={point} />}
      </For>
    </div>
  )
}
