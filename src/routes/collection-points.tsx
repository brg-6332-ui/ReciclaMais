import {
  createEffect,
  createMemo,
  createResource,
  createSignal,
  For,
  Show,
} from 'solid-js'

import { Select, SelectItem } from '~/components/ui/select'
import { useCollectionPointsFilter } from '~/modules/collection-points/hooks/useCollectionPointsFilter'
import { useMapUrlParams } from '~/modules/collection-points/hooks/useMapUrlParams'
import { FeatureCollectionSchema } from '~/modules/collection-points/schemas'
import { CollectionPointsList } from '~/modules/collection-points/sections/CollectionPointsList'
import { MapContainer } from '~/modules/collection-points/sections/MapContainer'
import { WasteFilterChips } from '~/modules/collection-points/sections/WasteFilterChips'
import type { CollectionPoint } from '~/modules/collection-points/types'
import {
  BRAGA_CENTER,
  getWasteTypeLabel,
  sortByProximity,
} from '~/modules/collection-points/utils/wasteSearch'
import { useGeolocation } from '~/modules/map/hooks/useGeolocation'
import wasteTypes from '~/wasteTypes.json'

async function fetchCollectionPoints(): Promise<CollectionPoint[]> {
  const res = await fetch('/api/location')
  if (!res.ok) throw new Error(`Failed to fetch locations: ${res.status}`)
  const data = (await res.json()) as unknown

  // Validate runtime shape of the response
  const parsed = FeatureCollectionSchema.safeParse(data)
  if (!parsed.success) {
    // Log validation issues for debugging and surface an error to the caller
    // so the resource enters the error state in the UI.
    console.error('Invalid FeatureCollection from /api/location', parsed.error)
    throw new Error('Invalid data from /api/location')
  }

  const features = parsed.data.features

  return features.map((f, idx) => {
    const props = f.properties ?? {}
    const coords = f.geometry?.coordinates ?? [0, 0]
    const wTypesRaw: unknown = props.wasteTypes ?? []
    const types = Array.isArray(wTypesRaw) ? (wTypesRaw as string[]) : []
    const name = props.name ?? props.slug ?? `Ponto ${idx + 1}`
    const company = props.company ?? ''
    const address = props.address ?? ''
    const phone = props.phone ?? ''
    const schedule = props.schedule ?? ''
    const rating = Number(props.rating) || 4.0
    const key =
      props.slug ?? (props.id ? String(props.id) : null) ?? name ?? String(idx)

    return {
      id: idx + 1,
      key,
      name,
      company,
      address,
      phone,
      schedule,
      rating,
      types,
      lat: coords[1],
      lng: coords[0],
    } as CollectionPoint
  })
}

export default function CollectionPoints() {
  const [selectedType, setSelectedType] = createSignal<string>('all')
  const [selectedKey, setSelectedKey] = createSignal<string | null>(null)

  const {
    userLat,
    setUserLat,
    userLng,
    setUserLng,
    search,
    setSearch,
    placeId,
    setPlaceId,
    isFullscreen,
    setIsFullscreen,
    wasteFilter,
    setWasteFilter,
  } = useMapUrlParams()

  // Get user geolocation for proximity sorting
  const { position: geoPosition } = useGeolocation({
    enableHighAccuracy: false,
    timeout: 10000,
  })

  // Sync waste URL param → selectedType dropdown
  createEffect(() => {
    const waste = wasteFilter()
    if (waste) {
      setSelectedType(waste)
    }
  })

  // Sync selectedType dropdown → wasteFilter (bidirectional)
  const handleTypeChange = (value: string) => {
    setSelectedType(value)
    if (value === 'all') {
      setWasteFilter(null)
    } else {
      setWasteFilter(value)
    }
  }

  const handleClearWasteFilter = () => {
    setWasteFilter(null)
    setSelectedType('all')
  }

  const [points] = createResource<CollectionPoint[]>(fetchCollectionPoints)

  // Resource returns undefined while loading; create an accessor that
  // always yields an array so downstream hooks/components follow the
  // project's pattern of not having to deal with undefined values.
  const pointsAccessor = () => points() ?? []

  const filteredPoints = useCollectionPointsFilter(pointsAccessor, selectedType)

  // Reference location for proximity sorting: user GPS > URL coords > Braga center
  const referenceLocation = createMemo(() => {
    const geo = geoPosition()
    if (geo) return { lat: geo.lat, lng: geo.lng }
    const uLat = userLat()
    const uLng = userLng()
    if (uLat !== null && uLng !== null) return { lat: uLat, lng: uLng }
    return BRAGA_CENTER
  })

  const usingFallbackLocation = createMemo(() => {
    const geo = geoPosition()
    const uLat = userLat()
    return !geo && uLat === null
  })

  // Sort by proximity when waste filter is active
  const sortedPoints = createMemo(() => {
    const pts = filteredPoints()
    if (!wasteFilter()) return pts
    const ref = referenceLocation()
    return sortByProximity(pts, ref.lat, ref.lng)
  })

  const selectedPoint = createMemo(
    () => pointsAccessor().find((p) => p.key === selectedKey()) ?? null,
  )

  // When exiting fullscreen, close the details panel
  createEffect(() => {
    if (!isFullscreen()) {
      setSelectedKey(null)
    }
  })

  const handleLocationSelect = (lat: number, lng: number) => {
    setUserLat(lat)
    setUserLng(lng)
  }

  /** Called when a card in the list or a map marker is clicked. */
  const handleSelectPoint = (pointOrKey: CollectionPoint | string) => {
    const key = typeof pointOrKey === 'string' ? pointOrKey : pointOrKey.key
    setSelectedKey(key)
    if (!isFullscreen()) {
      setIsFullscreen(true)
    }
  }

  const handleCloseDetails = () => {
    setSelectedKey(null)
  }

  return (
    <div class="min-h-screen py-12">
      <div class="container mx-auto px-4">
        <div class="mb-12 text-center">
          <h1 class="text-4xl md:text-5xl font-bold mb-4">Pontos de Recolha</h1>
          <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
            Encontre o ponto de recolha mais próximo e comece a reciclar hoje
          </p>
        </div>

        {/* Active waste filter chips */}
        <Show when={wasteFilter()}>
          <div class="mb-4">
            <WasteFilterChips
              wasteFilter={wasteFilter}
              onClear={handleClearWasteFilter}
            />
            <Show when={usingFallbackLocation()}>
              <p class="mt-2 text-sm text-muted-foreground">
                📍 A ordenar por proximidade de Braga. Ative a localização para
                resultados mais precisos.
              </p>
            </Show>
          </div>
        </Show>

        <MapContainer
          placeId={placeId}
          search={search}
          userLat={userLat}
          userLng={userLng}
          isFullscreen={isFullscreen}
          onSearchChange={setSearch}
          onPlaceSelected={setPlaceId}
          onLocationSelect={handleLocationSelect}
          onFullscreenToggle={setIsFullscreen}
          selectedPoint={selectedPoint}
          selectedKey={selectedKey}
          onCloseDetails={handleCloseDetails}
          onSelectPoint={handleSelectPoint}
          wasteFilter={wasteFilter}
          onClearWasteFilter={handleClearWasteFilter}
          onWasteFilterChange={setWasteFilter}
        />

        {/* Filter */}
        <div class="mb-8">
          <Select
            value={selectedType()}
            onInput={(e) =>
              handleTypeChange((e.target as HTMLSelectElement).value)
            }
            class="w-full md:w-64"
          >
            <For each={wasteTypes}>
              {(type) => (
                <SelectItem value={type.value}>{type.label}</SelectItem>
              )}
            </For>
          </Select>
        </div>

        {/* Empty state */}
        <Show
          when={!points.loading && sortedPoints().length === 0 && wasteFilter()}
        >
          <div class="text-center py-12">
            <p class="text-lg text-muted-foreground">
              Não encontrámos pontos para{' '}
              <strong>{getWasteTypeLabel(wasteFilter()!)}</strong> nas
              proximidades.
            </p>
            <p class="text-sm text-muted-foreground mt-2">
              Tente outro resíduo ou limpe os filtros.
            </p>
            <button
              type="button"
              class="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              onClick={handleClearWasteFilter}
            >
              Limpar filtros
            </button>
          </div>
        </Show>

        {/* Loading state */}
        <Show when={points.loading}>
          <div class="text-center py-12">
            <p class="text-muted-foreground">A carregar pontos de recolha…</p>
          </div>
        </Show>

        {/* Error state */}
        <Show when={points.error as unknown as boolean}>
          <div class="text-center py-12">
            <p class="text-lg text-red-600">
              Erro ao carregar pontos de recolha.
            </p>
            <button
              type="button"
              class="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              onClick={() => location.reload()}
            >
              Tentar novamente
            </button>
          </div>
        </Show>

        <CollectionPointsList
          points={sortedPoints}
          selectedKey={selectedKey}
          onSelect={handleSelectPoint}
        />
      </div>
    </div>
  )
}
