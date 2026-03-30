import {
  MoreVertical,
  Pause,
  Play,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-solid'
import { createEffect, createSignal, onCleanup, Show } from 'solid-js'

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
  clearing: boolean
  onFiltersChange: (filters: GpsFilters) => void
  onApply: () => void
  onRefresh: () => void
  onClearData: () => void
  onTogglePause: () => void
}) {
  let windowHRef: HTMLSelectElement | undefined
  let tzRef: HTMLInputElement | undefined
  let includeEventsRef: HTMLInputElement | undefined
  let eventsLimitRef: HTMLInputElement | undefined
  let actionsMenuRef: HTMLDivElement | undefined

  const [actionsOpen, setActionsOpen] = createSignal(false)

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

  createEffect(() => {
    if (!actionsOpen()) return

    const onDocClick = (event: MouseEvent) => {
      const target = event.target as Node | null
      if (actionsMenuRef && target && !actionsMenuRef.contains(target)) {
        setActionsOpen(false)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActionsOpen(false)
    }

    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onKeyDown)

    onCleanup(() => {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onKeyDown)
    })
  })

  createEffect(() => {
    if (props.clearing && actionsOpen()) {
      setActionsOpen(false)
    }
  })

  return (
    <div class="rounded-lg border border-base-300 bg-base-100 p-4">
      <div class="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div class="flex flex-wrap items-end gap-3">
          {/* Window hours */}
          <div class="space-y-1 min-w-[5.25rem]">
            <label for="gps-window-h" class="text-xs text-text-300 font-medium">
              Janela (h)
            </label>
            <select
              id="gps-window-h"
              ref={windowHRef}
              class="flex h-9 w-full rounded-md border border-base-300 bg-base-100 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
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
          <div class="space-y-1 min-w-[11rem]">
            <label for="gps-tz" class="text-xs text-text-300 font-medium">
              Timezone
            </label>
            <Input
              id="gps-tz"
              ref={tzRef}
              type="text"
              value={props.filters.tz}
              placeholder="Europe/Lisbon"
              class="h-9 w-44 max-w-full text-sm"
            />
          </div>

          {/* Include events toggle */}
          <div class="space-y-1 min-w-[7.5rem]">
            <label
              for="gps-include-events"
              class="text-xs text-text-300 font-medium block"
            >
              Eventos
            </label>
            <label class="inline-flex h-9 items-center gap-2 cursor-pointer">
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
            <div class="space-y-1 min-w-[5.25rem]">
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
        </div>

        {/* Action buttons */}
        <div class="flex flex-wrap items-center gap-2 xl:ml-auto">
          <Button
            variant="default"
            size="sm"
            onClick={handleApply}
            disabled={props.loading || props.clearing}
          >
            <Search class="w-3.5 h-3.5" />
            Aplicar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => props.onRefresh()}
            disabled={props.loading || props.clearing}
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
            disabled={props.clearing}
          >
            <Show when={props.paused} fallback={<Pause class="w-3.5 h-3.5" />}>
              <Play class="w-3.5 h-3.5" />
            </Show>
            {props.paused ? 'Retomar' : 'Pausar'}
          </Button>

          <div ref={actionsMenuRef} class="relative">
            <Button
              variant="ghost"
              size="sm"
              aria-haspopup="menu"
              aria-expanded={actionsOpen()}
              aria-label="Mais ações"
              disabled={props.clearing}
              onClick={() => setActionsOpen((prev) => !prev)}
            >
              <MoreVertical class="w-3.5 h-3.5" />
            </Button>

            <Show when={actionsOpen()}>
              <div
                role="menu"
                class="absolute right-0 z-30 mt-2 w-52 max-w-[calc(100vw-2rem)] overflow-hidden rounded-md border border-base-300 bg-base-50 p-1 shadow-lg"
              >
                <button
                  type="button"
                  role="menuitem"
                  class="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-text-700 transition-colors hover:bg-base-200 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={props.clearing}
                  onClick={() => {
                    setActionsOpen(false)
                    props.onClearData()
                  }}
                >
                  <Trash2 class="w-3.5 h-3.5" />
                  Limpar dados de teste
                </button>
              </div>
            </Show>
          </div>
        </div>
      </div>
    </div>
  )
}
