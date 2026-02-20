import {
  Building2,
  Clock,
  MapPin,
  Phone,
  RadioIcon,
  Star,
  X,
} from 'lucide-solid'
import { Accessor, For, Show } from 'solid-js'

import { Badge } from '~/components/ui/badge'
import SlideOver from '~/components/ui/SlideOver'

import { useTypeMetadata } from '../hooks/useTypeMetadata'
import type { CollectionPoint } from '../types'

interface CollectionPointDetailsPanelProps {
  /** The selected collection point to display (null = hidden) */
  selectedPoint: Accessor<CollectionPoint | null>
  /** Callback to close the panel */
  onClose: () => void
}

/**
 * Panel displaying detailed information about a selected collection point.
 * Desktop: floating card at the bottom-left of the fullscreen map.
 * Mobile: SlideOver from the right.
 */
export function CollectionPointDetailsPanel(
  props: CollectionPointDetailsPanelProps,
) {
  const { getTypeColor, getTypeLabel } = useTypeMetadata()
  const isOpen = () => props.selectedPoint() !== null

  return (
    <>
      {/* Desktop: floating panel */}
      <Show when={isOpen()}>
        <div class="hidden md:block absolute bottom-4 left-4 z-60 w-[360px] animate-slide-up">
          <div class="rounded-xl bg-base-50/80 dark:bg-base-900/80 backdrop-blur-xl shadow-2xl border border-base-200 dark:border-base-700 overflow-hidden">
            <DetailsContent
              point={props.selectedPoint()!}
              onClose={props.onClose}
              getTypeColor={getTypeColor}
              getTypeLabel={getTypeLabel}
            />
          </div>
        </div>
      </Show>

      {/* Mobile: SlideOver */}
      <SlideOver open={isOpen} onClose={props.onClose} widthClass="w-80">
        <Show when={props.selectedPoint()}>
          {(point) => (
            <div class="h-full bg-base-50 dark:bg-base-900 overflow-y-auto">
              <DetailsContent
                point={point()}
                onClose={props.onClose}
                getTypeColor={getTypeColor}
                getTypeLabel={getTypeLabel}
              />
            </div>
          )}
        </Show>
      </SlideOver>
    </>
  )
}

interface GpsPointDetailsPanelProps {
  /** Latitude of the GPS point */
  lat: Accessor<number | null>
  /** Longitude of the GPS point */
  lng: Accessor<number | null>
  /** Whether the GPS panel is open */
  open: Accessor<boolean>
  /** Callback to close the panel */
  onClose: () => void
}

/**
 * Simplified panel for GPS demo markers.
 * Shows explanation text and coordinates.
 */
export function GpsPointDetailsPanel(props: GpsPointDetailsPanelProps) {
  return (
    <>
      {/* Desktop */}
      <Show when={props.open()}>
        <div class="hidden md:block absolute bottom-4 left-4 z-60 w-[360px] animate-slide-up">
          <div class="rounded-xl bg-base-50/80 dark:bg-base-900/80 backdrop-blur-xl shadow-2xl border border-base-200 dark:border-base-700 overflow-hidden">
            <GpsContent
              lat={props.lat()}
              lng={props.lng()}
              onClose={props.onClose}
            />
          </div>
        </div>
      </Show>

      {/* Mobile */}
      <SlideOver open={props.open} onClose={props.onClose} widthClass="w-80">
        <Show when={props.open()}>
          <div class="h-full bg-base-50 dark:bg-base-900 overflow-y-auto">
            <GpsContent
              lat={props.lat()}
              lng={props.lng()}
              onClose={props.onClose}
            />
          </div>
        </Show>
      </SlideOver>
    </>
  )
}

/* ---------- Internal content components ---------- */

function DetailsContent(props: {
  point: CollectionPoint
  onClose: () => void
  getTypeColor: (type: string) => string
  getTypeLabel: (type: string) => string
}) {
  return (
    <div class="p-5 space-y-4">
      {/* Header */}
      <div class="flex items-start justify-between gap-2">
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-bold text-text-900 leading-tight truncate">
            {props.point.name}
          </h3>
          <Show when={props.point.company}>
            <p class="text-sm text-text-500 mt-0.5 flex items-center gap-1.5">
              <Building2 class="h-3.5 w-3.5 shrink-0" />
              {props.point.company}
            </p>
          </Show>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <div class="flex items-center gap-1.5 bg-primary-500/10 border border-primary-500/25 px-2.5 py-1 rounded-lg text-sm shadow-sm">
            <Star class="h-3.5 w-3.5 text-primary-600 fill-primary-600" />
            <span class="font-semibold text-primary-700">
              {props.point.rating}
            </span>
          </div>
          <button
            class="rounded-full p-1 hover:bg-base-200 dark:hover:bg-base-700 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              props.onClose()
            }}
            aria-label="Fechar detalhes"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Info rows */}
      <div class="space-y-2.5 text-sm">
        <Show when={props.point.address}>
          <div class="flex items-start gap-2.5">
            <MapPin class="h-4 w-4 text-primary-600 mt-0.5 shrink-0" />
            <span class="text-text-500">{props.point.address}</span>
          </div>
        </Show>

        <Show when={props.point.schedule}>
          <div class="flex items-center gap-2.5">
            <Clock class="h-4 w-4 text-primary-600 shrink-0" />
            <span class="text-text-500">{props.point.schedule}</span>
          </div>
        </Show>

        <Show when={props.point.phone}>
          <div class="flex items-center gap-2.5">
            <Phone class="h-4 w-4 text-primary-600 shrink-0" />
            <span class="text-text-500">{props.point.phone}</span>
          </div>
        </Show>
      </div>

      {/* Waste type badges */}
      <Show when={props.point.types.length > 0}>
        <div class="flex flex-wrap gap-1.5 pt-1">
          <For each={props.point.types}>
            {(type) => (
              <Badge variant="outline" class={props.getTypeColor(type)}>
                {props.getTypeLabel(type)}
              </Badge>
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}

function GpsContent(props: {
  lat: number | null
  lng: number | null
  onClose: () => void
}) {
  return (
    <div class="p-5 space-y-4">
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-2">
          <div class="rounded-full bg-blue-100 dark:bg-blue-900/40 p-2">
            <RadioIcon class="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 class="text-lg font-bold">Ponto em Tempo Real</h3>
        </div>
        <button
          class="rounded-full p-1 hover:bg-base-200 dark:hover:bg-base-700 transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            props.onClose()
          }}
          aria-label="Fechar detalhes"
        >
          <X class="h-4 w-4" />
        </button>
      </div>

      <p class="text-sm text-muted-foreground">
        Este marcador representa um ponto de recolha em tempo real, criado para
        fins demonstrativos do projeto PAP.
      </p>

      <Show when={props.lat !== null && props.lng !== null}>
        <div class="rounded-lg bg-base-100 dark:bg-base-800 px-3 py-2 text-xs font-mono text-muted-foreground space-y-1">
          <div>
            Latitude:{' '}
            <span class="text-foreground">{props.lat?.toFixed(6)}</span>
          </div>
          <div>
            Longitude:{' '}
            <span class="text-foreground">{props.lng?.toFixed(6)}</span>
          </div>
        </div>
      </Show>
    </div>
  )
}
