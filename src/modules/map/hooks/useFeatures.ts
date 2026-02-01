import { FeatureCollection, Point } from 'geojson'
import { onMount, untrack } from 'solid-js'
import { createStore } from 'solid-js/store'

import { POIBasic } from '~/modules/map/hooks/usePOI'

async function loadFeaturesDataset(): Promise<
  FeatureCollection<Point, POIBasic>
> {
  const res = await fetch('/api/location')
  if (!res.ok) throw new Error(`Failed to fetch locations: ${res.status}`)
  const data = (await res.json()) as FeatureCollection<Point, POIBasic>
  return data
}

export function useFeatures() {
  const [features, setFeatures] = createStore<
    FeatureCollection<Point, POIBasic>
  >({
    type: 'FeatureCollection',
    features: [],
  })

  onMount(() => {
    // initial load
    void loadFeaturesDataset()
      .then((data) => setFeatures(data))
      .catch(console.error)

    // periodic polling
    setInterval(() => {
      loadFeaturesDataset()
        .then((data) => {
          // Read reactive store values inside `untrack` because this callback
          // runs outside Solid's tracked reactivity (setInterval promise).
          untrack(() => {
            console.debug(
              'Received GPS count = ',
              data.features.filter((f) => f.properties.type === 'gps').length,
            )
            const oldById = new Map(
              features.features.map((f) => [f.properties.id, f]),
            )

            const newById = new Map(
              data.features.map((f) => [f.properties.id, f]),
            )

            /* ---------- REMOÇÕES ---------- */
            setFeatures('features', (fs) =>
              fs.filter((f) => newById.has(f.properties.id)),
            )

            /* ---------- INSERÇÕES ---------- */
            const toInsert: typeof data.features = []

            for (const [id, feature] of newById) {
              if (!oldById.has(id)) {
                toInsert.push(feature)
              }
            }

            if (toInsert.length) {
              setFeatures('features', (fs) => [...fs, ...toInsert])
            }

            /* ---------- UPDATES ---------- */
            for (let i = 0; i < features.features.length; i++) {
              const current = features.features[i]
              const incoming = newById.get(current.properties.id)
              if (!incoming) continue

              const [lng1, lat1] = current.geometry.coordinates
              const [lng2, lat2] = incoming.geometry.coordinates

              if (lng1 !== lng2 || lat1 !== lat2) {
                setFeatures('features', i, 'geometry', incoming.geometry)
              }
            }
          })
        })
        .catch(console.error)
    }, 1000)
  })

  return [features, setFeatures] as const
}
