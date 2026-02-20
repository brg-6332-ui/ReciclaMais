import { XIcon } from 'lucide-solid'
import type { Accessor } from 'solid-js'
import { Show } from 'solid-js'

import { getWasteTypeLabel } from '~/features/collection-points/utils/wasteSearch'

/**
 * Props for the WasteFilterChips component.
 */
export type WasteFilterChipsProps = {
  /** Active waste type filter value (null = no filter) */
  wasteFilter: Accessor<string | null>
  /** Callback to clear the filter */
  onClear: () => void
}

/**
 * Displays active waste type filter as a removable chip.
 */
export function WasteFilterChips(props: WasteFilterChipsProps) {
  return (
    <Show when={props.wasteFilter()}>
      <div class="flex items-center gap-2 flex-wrap">
        <span class="inline-flex items-center gap-1.5 bg-primary-100 text-primary-800 border border-primary-300 rounded-full px-3 py-1 text-sm font-medium">
          {getWasteTypeLabel(props.wasteFilter()!)}
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full p-0.5 hover:bg-primary-200 transition-colors"
            onClick={() => props.onClear()}
            aria-label={`Remover filtro ${getWasteTypeLabel(props.wasteFilter()!)}`}
          >
            <XIcon class="h-3.5 w-3.5" />
          </button>
        </span>
        <button
          type="button"
          class="text-xs text-muted-foreground hover:text-base-content underline transition-colors"
          onClick={() => props.onClear()}
        >
          Limpar filtros
        </button>
      </div>
    </Show>
  )
}
