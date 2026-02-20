import { Key } from '@solid-primitives/keyed'
import { MapPinIcon, RadioIcon, Recycle } from 'lucide-solid'
import { AdvancedMarker, Map } from 'solid-google-maps'
import { createEffect, createMemo, on, Show } from 'solid-js'
import Supercluster from 'supercluster'

import { useFeatures } from '~/features/map/hooks/useFeatures'
import { useGooglePlacesService } from '~/features/map/hooks/useGooglePlacesService'
import {
  DEFAULT_MAP_PROPS,
  useMapRefSignals,
} from '~/features/map/hooks/useMapRefSignals'
import { POIBasic } from '~/features/map/hooks/usePOI'
import { useSupercluster } from '~/features/map/hooks/useSupercluster'
import { themeUseCases } from '~/features/theme/application/usecases/themeUseCases'
import { env } from '~/utils/env'

export function CollectionPointsMap(props: {
  search?: string | null
  placeId?: string | null
  lat?: number | null
  lng?: number | null
  /** Key of the currently selected point for highlighting */
  selectedKey?: string | null
  /** Callback when a collection-point marker is clicked */
  onPointSelect?: (key: string) => void
  /** Callback when a GPS marker is clicked */
  onGpsSelect?: (lat: number, lng: number) => void
  /** Active waste type filter */
  wasteFilter?: string | null
}) {
  const [features] = useFeatures()
  const { mapRef, setMapRef, bounds, zoom } = useMapRefSignals()

  createEffect(() => {
    console.log('[TestMap] mapRef changed:', mapRef())
  })

  const { service: placesService } = useGooglePlacesService({ mapRef })

  // Filter features by waste type (keep GPS markers always visible)
  const filteredFeatures = createMemo(() => {
    const wasteType = props.wasteFilter
    if (!wasteType) return features

    return {
      ...features,
      features: features.features.filter((f) => {
        // Always show GPS markers
        if (f.properties.type === 'gps') return true
        // Filter collection points by waste type
        const wasteTypes = f.properties.wasteTypes
        if (!wasteTypes || !Array.isArray(wasteTypes)) return false
        return wasteTypes.includes(wasteType)
      }),
    }
  })

  const { clusters, getClusterExpansionZoom } = useSupercluster(
    () => filteredFeatures(),
    bounds,
    zoom,
    () => ({
      extent: 256,
      radius: 60,
      maxZoom: 12,
    }),
  )

  /** Derive a stable key from a feature's properties (mirrors the list key). */
  const featureKey = (feature: Supercluster.PointFeature<POIBasic>): string => {
    const p = feature.properties
    return p.slug ?? (p.id ? String(p.id) : '') ?? ''
  }

  // Pan + zoom to the selected point when selectedKey changes
  createEffect(
    on(
      () => props.selectedKey,
      (key) => {
        if (!key) return
        const map = mapRef()
        if (!map) return

        const match = filteredFeatures().features.find((f) => {
          const p = f.properties
          const k = p.slug ?? (p.id ? String(p.id) : '') ?? ''
          return k === key
        })
        if (!match) return
        const [lng, lat] = match.geometry.coordinates
        map.panTo({ lat, lng })
        // Only zoom in if the current zoom is too far out
        const currentZoom = map.getZoom() ?? 14
        if (currentZoom < 15) {
          map.setZoom(16)
        }
      },
    ),
  )

  const zoomToPlaceId = (placeId: string) => {
    const service = placesService()
    if (!service) {
      console.warn('PlacesService not initialized')
      return
    }
    service.getDetails(
      {
        placeId,
        fields: ['geometry'],
      },
      (place, status) => {
        if (
          status === google.maps.places.PlacesServiceStatus.OK &&
          place?.geometry?.location
        ) {
          const location = place.geometry.location
          mapRef()?.panTo(location)
          mapRef()?.setZoom(16)
        } else {
          console.warn(`Failed to get place details: ${status}`)
        }
      },
    )
  }

  const zoomToCluster = (
    cluster: Supercluster.ClusterFeature<Supercluster.ClusterProperties>,
  ) => {
    const expansionZoom = getClusterExpansionZoom(cluster.id as number)
    const [lng, lat] = cluster.geometry.coordinates
    mapRef()?.setZoom(expansionZoom + 1)
    mapRef()?.panTo({ lat, lng })
  }

  // Zoom to a placeId only when the placeId prop becomes available
  createEffect(
    on(
      () => [placesService(), props.placeId],
      ([service, id]) => {
        if (!service) {
          console.warn('PlacesService not initialized yet')
          return
        }
        console.log('PlacesService initialized')

        if (typeof id !== 'string' || !id) {
          console.warn('No valid placeId provided:', id)
          return
        }

        if (id) {
          // small delay to ensure map is fully initialized
          setTimeout(() => {
            zoomToPlaceId(id)
          }, 500)
        }
      },
    ),
  )

  // Zoom to provided lat/lng only when those props change
  createEffect(
    on(
      () => [props.lat, props.lng],
      ([lat, lng]) => {
        const map = mapRef()
        if (
          lat !== null &&
          lng !== null &&
          lat !== undefined &&
          lng !== undefined &&
          map
        ) {
          console.log('[TestMap] Zooming to user location:', { lat, lng })
          map.panTo({ lat, lng })
          map.setZoom(16)
        }
      },
    ),
  )

  return (
    <Map
      style={{ height: '100vh', width: '100vw' }}
      mapId={env.VITE_GOOGLE_MAPS_MAP_ID}
      defaultCenter={DEFAULT_MAP_PROPS.center}
      defaultZoom={DEFAULT_MAP_PROPS.zoom}
      gestureHandling={'greedy'}
      disableDefaultUI
      colorScheme={themeUseCases.currentTheme() === 'dark' ? 'DARK' : 'LIGHT'}
      ref={setMapRef}
    >
      <Key each={clusters()} by={(item) => item.id}>
        {(featureOrCluster) => (
          <DynamicFeatureClusterMarker
            featureOrCluster={featureOrCluster()}
            zoomToCluster={zoomToCluster}
            selectedKey={props.selectedKey ?? null}
            onPointSelect={(key) => props.onPointSelect?.(key)}
            onGpsSelect={(lat, lng) => props.onGpsSelect?.(lat, lng)}
            featureKey={featureKey}
          />
        )}
      </Key>
    </Map>
  )
}

function DynamicFeatureClusterMarker(props: {
  featureOrCluster:
    | Supercluster.PointFeature<POIBasic>
    | Supercluster.ClusterFeature<Supercluster.ClusterProperties>
  zoomToCluster?: (
    featureOrCluster: Supercluster.ClusterFeature<Supercluster.ClusterProperties>,
  ) => void
  selectedKey?: string | null
  onPointSelect?: (key: string) => void
  onGpsSelect?: (lat: number, lng: number) => void
  featureKey: (feature: Supercluster.PointFeature<POIBasic>) => string
}) {
  const isCluster = () =>
    (props.featureOrCluster.properties as Record<string, unknown>).cluster
  return (
    <>
      <Show when={isCluster()}>
        <ClusterMarker
          cluster={
            props.featureOrCluster as Supercluster.ClusterFeature<Supercluster.ClusterProperties>
          }
          onClick={() => {
            if (isCluster()) {
              props.zoomToCluster?.(
                props.featureOrCluster as Supercluster.ClusterFeature<Supercluster.ClusterProperties>,
              )
            }
          }}
        />
      </Show>
      <Show when={!isCluster()}>
        {(() => {
          const feature =
            props.featureOrCluster as Supercluster.PointFeature<POIBasic>
          const key = props.featureKey(feature)

          return feature.properties.type === 'gps' ? (
            <GpsFeatureMarker
              feature={feature}
              onClick={() => {
                const [lng, lat] = feature.geometry.coordinates
                props.onGpsSelect?.(lat, lng)
              }}
            />
          ) : (
            <FeatureMarker
              feature={feature}
              selected={key === props.selectedKey}
              onClick={() => {
                props.onPointSelect?.(key)
              }}
            />
          )
        })()}
      </Show>
    </>
  )
}

function ClusterMarker(props: {
  cluster: Supercluster.ClusterFeature<Supercluster.ClusterProperties>
  onClick?: () => void
}) {
  const position = () => {
    const [lng, lat] = props.cluster.geometry.coordinates
    return { lat, lng }
  }
  return (
    <AdvancedMarker
      position={position()}
      zIndex={props.cluster.properties.point_count}
      onClick={props.onClick}
    >
      <div class="flex items-center justify-center">
        <div
          class="relative flex items-center justify-center rounded-full shadow-sm"
          style="width:52px;height:52px"
        >
          <div class="absolute inset-0 rounded-full bg-marker-background-cluster opacity-90" />
          <div class="relative z-10 text-marker-icon-cluster flex items-center justify-center">
            <Recycle class="w-6 h-6" />
          </div>
          <div class="absolute -bottom-1.5 right-0 bg-marker-badge-background text-xs font-semibold text-marker-text px-1.5 py-0.5 rounded-full shadow-sm">
            {props.cluster.properties.point_count_abbreviated}
          </div>
        </div>
      </div>
    </AdvancedMarker>
  )
}

function FeatureMarker(props: {
  feature: Supercluster.PointFeature<POIBasic>
  selected?: boolean
  onClick?: () => void
}) {
  const position = () => {
    const [lng, lat] = props.feature.geometry.coordinates
    return { lat, lng }
  }
  return (
    <AdvancedMarker
      position={position()}
      onClick={props.onClick}
      zIndex={props.selected ? 999 : undefined}
    >
      <div class="flex items-center justify-center transition-transform duration-200">
        <div
          class="relative rounded-full shadow-sm flex items-center justify-center transition-all duration-200"
          style={{
            width: props.selected ? '48px' : '36px',
            height: props.selected ? '48px' : '36px',
          }}
        >
          {/* Selection glow ring */}
          <Show when={props.selected}>
            <div class="absolute -inset-1.5 rounded-full bg-primary-400/30 animate-pulse" />
          </Show>
          <div
            class={`absolute inset-0 rounded-full ${
              props.selected
                ? 'bg-primary-600 ring-2 ring-primary-300/60'
                : 'bg-marker-background-single opacity-90'
            }`}
          />
          <div
            class={`relative z-10 flex items-center justify-center ${
              props.selected ? 'text-white' : 'text-marker-icon-single'
            }`}
          >
            <MapPinIcon class={props.selected ? 'w-6 h-6' : 'w-5 h-5'} />
          </div>
        </div>
      </div>
    </AdvancedMarker>
  )
}

function GpsFeatureMarker(props: {
  feature: Supercluster.PointFeature<POIBasic>
  onClick?: () => void
}) {
  const position = () => {
    const [lng, lat] = props.feature.geometry.coordinates
    return { lat, lng }
  }
  return (
    <AdvancedMarker position={position()} onClick={props.onClick}>
      <div class="flex items-center justify-center cursor-pointer">
        <div
          class="relative rounded-full shadow-md flex items-center justify-center"
          style="width:40px;height:40px"
        >
          <div class="absolute inset-0 rounded-full bg-blue-700" />
          <div class="relative z-10 text-blue-200 flex items-center justify-center">
            <RadioIcon class="w-5 h-5" />
          </div>
        </div>
      </div>
    </AdvancedMarker>
  )
}
