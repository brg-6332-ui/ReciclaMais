import { Pause, Play, RefreshCw, Search } from 'lucide-solid'
import { Show } from 'solid-js'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import type { GpsFilters } from '~/modules/test-gps/types'

/**
 * Control bar for the GPS dashboard: filter inputs, apply/refresh/pause buttons.
 */
export default function ControlBar(props: {
  filters: GpsFilters
  paused: boolean
  loading: boolean
  onFiltersChange: (filters: GpsFilters) => void
  onApply: () => void
  onRefresh: () => void
  onTogglePause: () => void
}) {
  let windowHRef: HTMLSelectElement | undefined
  let tzRef: HTMLInputElement | undefined
  let includeEventsRef: HTMLInputElement | undefined
  let eventsLimitRef: HTMLInputElement | undefined

  const handleApply = () => {
    const windowH = Number(windowHRef?.value ?? props.filters.windowH)
    const tz = tzRef?.value?.trim() || props.filters.tz
    const includeOutageEvents = includeEventsRef?.checked ?? false
    const eventsLimit = Number(
      eventsLimitRef?.value ?? props.filters.eventsLimit,
    )

    props.onFiltersChange({
      windowH: Number.isFinite(windowH) && windowH > 0 ? windowH : 24,
      tz,
      includeOutageEvents,
      eventsLimit:
        Number.isFinite(eventsLimit) && eventsLimit > 0 ? eventsLimit : 100,
    })
    props.onApply()
  }

  return (
    <div class="rounded-lg border border-base-300 bg-base-100 p-4">
      <div class="flex flex-wrap items-end gap-3">
        {/* Window hours */}
        <div class="space-y-1">
          <label for="gps-window-h" class="text-xs text-text-300 font-medium">
            Janela (h)
          </label>
          <select
            id="gps-window-h"
            ref={windowHRef}
            class="flex h-9 rounded-md border border-base-300 bg-base-100 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            <option value="1" selected={props.filters.windowH === 1}>
              1h
            </option>
            <option value="6" selected={props.filters.windowH === 6}>
              6h
            </option>
            <option value="12" selected={props.filters.windowH === 12}>
              12h
            </option>
            <option value="24" selected={props.filters.windowH === 24}>
              24h
            </option>
            <option value="48" selected={props.filters.windowH === 48}>
              48h
            </option>
            <option value="168" selected={props.filters.windowH === 168}>
              7d
            </option>
          </select>
        </div>

        {/* Timezone */}
        <div class="space-y-1">
          <label for="gps-tz" class="text-xs text-text-300 font-medium">
            Timezone
          </label>
          <Input
            id="gps-tz"
            ref={tzRef}
            type="text"
            value={props.filters.tz}
            placeholder="Europe/Lisbon"
            class="h-9 w-40 text-sm"
          />
        </div>

        {/* Include events toggle */}
        <div class="space-y-1">
          <label
            for="gps-include-events"
            class="text-xs text-text-300 font-medium block"
          >
            Eventos
          </label>
          <label class="inline-flex items-center gap-2 cursor-pointer">
            <input
              id="gps-include-events"
              ref={includeEventsRef}
              type="checkbox"
              checked={props.filters.includeOutageEvents}
              class="checkbox checkbox-sm checkbox-primary"
            />
            <span class="text-sm text-text-500">Incluir</span>
          </label>
        </div>

        {/* Events limit */}
        <Show when={props.filters.includeOutageEvents}>
          <div class="space-y-1">
            <label
              for="gps-events-limit"
              class="text-xs text-text-300 font-medium"
            >
              Limite
            </label>
            <Input
              id="gps-events-limit"
              ref={eventsLimitRef}
              type="number"
              value={props.filters.eventsLimit}
              min={1}
              max={500}
              class="h-9 w-20 text-sm"
            />
          </div>
        </Show>

        {/* Action buttons */}
        <div class="flex items-center gap-2 ml-auto">
          <Button
            variant="default"
            size="sm"
            onClick={handleApply}
            disabled={props.loading}
          >
            <Search class="w-3.5 h-3.5" />
            Aplicar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => props.onRefresh()}
            disabled={props.loading}
          >
            <RefreshCw
              class="w-3.5 h-3.5"
              classList={{ 'animate-spin': props.loading }}
            />
            Atualizar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => props.onTogglePause()}
          >
            <Show when={props.paused} fallback={<Pause class="w-3.5 h-3.5" />}>
              <Play class="w-3.5 h-3.5" />
            </Show>
            {props.paused ? 'Retomar' : 'Pausar'}
          </Button>
        </div>
      </div>
    </div>
  )
}
