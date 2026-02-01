import { Key } from '@solid-primitives/keyed'
import { Leaf, RadioIcon, Recycle } from 'lucide-solid'
import { AdvancedMarker, Map } from 'solid-google-maps'
import { createEffect, Show } from 'solid-js'
import Supercluster from 'supercluster'

import { useFeatures } from '~/modules/map/hooks/useFeatures'
import { useGooglePlacesService } from '~/modules/map/hooks/useGooglePlacesService'
import {
  DEFAULT_MAP_PROPS,
  useMapRefSignals,
} from '~/modules/map/hooks/useMapRefSignals'
import { POIBasic } from '~/modules/map/hooks/usePOI'
import { useSupercluster } from '~/modules/map/hooks/useSupercluster'
import { themeUseCases } from '~/modules/theme/application/usecases/themeUseCases'
import { env } from '~/utils/env'

export function CollectionPointsMap(props: {
  search?: string | null
  placeId?: string | null
  lat?: number | null
  lng?: number | null
}) {
  const [features] = useFeatures()
  const { mapRef, setMapRef, bounds, zoom } = useMapRefSignals()

  createEffect(() => {
    console.log('[TestMap] mapRef changed:', mapRef())
  })

  const { service: placesService } = useGooglePlacesService({ mapRef })

  const { clusters, getClusterExpansionZoom } = useSupercluster(
    () => features,
    bounds,
    zoom,
    () => ({
      extent: 256,
      radius: 60,
      maxZoom: 12,
    }),
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

  createEffect(() => {
    if (!placesService()) {
      console.warn('PlacesService not initialized yet')
      return
    }
    console.log('PlacesService initialized')

    const id = props.placeId
    if (id) {
      setTimeout(() => {
        zoomToPlaceId(id)
      }, 500)
    }
  })

  createEffect(() => {
    const lat = props.lat
    const lng = props.lng
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
  })

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

          return feature.properties.type === 'gps' ? (
            <GpsFeatureMarker feature={feature} />
          ) : (
            <FeatureMarker feature={feature} />
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
          class="relative flex items-center justify-center rounded-full shadow-lg"
          style="width:64px;height:64px"
        >
          <div class="absolute inset-0 rounded-full bg-marker-background-cluster" />
          <div class="relative z-10 text-marker-icon-cluster flex items-center justify-center">
            <Recycle class="w-7 h-7" />
          </div>
          <div class="absolute -bottom-2 right-0 bg-marker-badge-background text-sm font-semibold text-marker-text px-2 py-0.5 rounded-full shadow-md">
            {props.cluster.properties.point_count_abbreviated}
          </div>
        </div>
      </div>
    </AdvancedMarker>
  )
}

function FeatureMarker(props: {
  feature: Supercluster.PointFeature<POIBasic>
  onClick?: () => void
}) {
  const position = () => {
    const [lng, lat] = props.feature.geometry.coordinates
    return { lat, lng }
  }
  return (
    <AdvancedMarker position={position()} onClick={props.onClick}>
      <div class="flex items-center justify-center">
        <div
          class="relative rounded-full shadow-md flex items-center justify-center"
          style="width:40px;height:40px"
        >
          <div class="absolute inset-0 rounded-full bg-marker-background-single" />
          <div class="relative z-10 text-marker-icon-single flex items-center justify-center">
            <Leaf class="w-5 h-5" />
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
      <div class="flex items-center justify-center">
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
