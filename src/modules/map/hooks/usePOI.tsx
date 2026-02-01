import { createSignal, onMount } from 'solid-js'

import * as POI from '~/poi.json'

export type POIBasic = {
  id: string | number
  latitude: number
  longitude: number
  slug: string
  type: string
  families_pope: { slug: string }[]
  location_types_pope: { slug: string }[]
  wasteTypes: string[]
  plainTypes: string
  plainFilters: string
}

export function usePOI() {
  const [pois, setPois] = createSignal<POIBasic[]>([])

  onMount(() => {
    setPois(
      POI.data.publicGetMapInformation.points
        .map(
          (poi) =>
            ({
              id: poi.id,
              latitude: parseFloat(poi.latitude),
              longitude: parseFloat(poi.longitude),
              slug: poi.slug,
              type: poi.type,
              families_pope: poi.families_pope,
              location_types_pope: poi.location_types_pope,
              wasteTypes: Array.isArray(poi.wasteTypes) ? poi.wasteTypes : [],
              plainTypes: poi.plainTypes,
              plainFilters: poi.plainFilters,
            }) satisfies POIBasic,
        )
        .filter((poi) => !isNaN(poi.latitude) && !isNaN(poi.longitude)),
    )
  })

  return {
    pois,
  }
}
