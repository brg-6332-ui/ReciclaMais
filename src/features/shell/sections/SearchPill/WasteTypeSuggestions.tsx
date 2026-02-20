import { RecycleIcon } from 'lucide-solid'
import type { Accessor } from 'solid-js'
import { For, Show } from 'solid-js'

import type { WasteTypeCatalogEntry } from '~/features/collection-points/utils/wasteSearch'

/**
 * Props for the WasteTypeSuggestions component.
 */
export type WasteTypeSuggestionsProps = {
  /** Matching waste type entries */
  suggestions: Accessor<WasteTypeCatalogEntry[]>
  /** Callback when a waste type is selected */
  onSelect: (entry: WasteTypeCatalogEntry) => void
}

/**
 * Dropdown section showing waste type suggestions in the search autocomplete.
 */
export function WasteTypeSuggestions(props: WasteTypeSuggestionsProps) {
  return (
    <Show when={props.suggestions().length > 0}>
      <div class="border-b border-base-200 pb-1">
        <div class="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Tipos de Resíduo
        </div>
        <ul>
          <For each={props.suggestions().slice(0, 6)}>
            {(entry) => (
              <li>
                <button
                  type="button"
                  class="w-full px-4 py-2.5 text-left hover:bg-base-500 transition-colors flex items-center gap-3"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onClick={() => props.onSelect(entry)}
                >
                  <RecycleIcon class="h-4 w-4 text-primary-600 flex-shrink-0" />
                  <span class="font-medium text-sm text-base-content">
                    {entry.label}
                  </span>
                </button>
              </li>
            )}
          </For>
        </ul>
      </div>
    </Show>
  )
}
