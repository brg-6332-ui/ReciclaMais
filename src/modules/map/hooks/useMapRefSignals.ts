import { createEffect, createSignal } from 'solid-js'

export const DEFAULT_MAP_PROPS = {
  center: { lat: 41.544581, lng: -8.427375 },
  zoom: 14,
}

/**
 * Hook for managing map reference and reactive bounds/zoom signals.
 *
 * @returns Map reference, bounds, and zoom signals
 *
 * @example
 * const { mapRef, setMapRef, bounds, zoom } = useMapRefSignals()
 */
export function useMapRefSignals() {
  const [mapRef, setMapRef] = createSignal<google.maps.Map | null>(null)

  const [bounds, setBounds] = createSignal<[number, number, number, number]>([
    -180, -90, 180, 90,
  ])
  const [zoom, setZoom] = createSignal<number>(DEFAULT_MAP_PROPS.zoom)

  const handleBoundsChanged = () => {
    try {
      // const bounds = new google.maps.LatLngBounds(input.detail.bounds)
      const bounds = mapRef()!.getBounds()!
      const zoom = mapRef()!.getZoom()!

      const sw = bounds.getSouthWest()
      const ne = bounds.getNorthEast()

      const paddingDegrees = 0

      const n = Math.min(90, ne.lat() + paddingDegrees)
      const s = Math.max(-90, sw.lat() - paddingDegrees)

      const w = sw.lng() - paddingDegrees
      const e = ne.lng() + paddingDegrees

      setBounds([w, s, e, n])
      setZoom(zoom)
    } catch {
      // ignore errors from bounds being invalid during map initialization
    }
  }

  createEffect(() => {
    const map = mapRef()
    if (!map) return

    // eslint-disable-next-line solid/reactivity
    const listener = map.addListener('idle', () => {
      handleBoundsChanged()
    })

    return () => {
      google.maps.event.removeListener(listener)
    }
  })

  return {
    mapRef,
    setMapRef,
    bounds,
    setBounds,
    zoom,
    setZoom,
  }
}
