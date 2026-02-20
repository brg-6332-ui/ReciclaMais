import type { Accessor } from 'solid-js'
import { For, Show } from 'solid-js'

/**
 * Props for the AutocompleteDropdown component.
 */
export type AutocompleteDropdownProps = {
  /**
   * Whether the dropdown is open.
   */
  isOpen: Accessor<boolean>

  /**
   * Current search query.
   */
  query: Accessor<string>

  /**
   * Autocomplete predictions to display.
   */
  predictions: Accessor<google.maps.places.AutocompletePrediction[]>

  /**
   * Whether predictions are loading.
   */
  loading: Accessor<boolean>

  /**
   * Callback fired when a prediction is selected.
   */
  onSelectPrediction: (
    prediction: google.maps.places.AutocompletePrediction,
  ) => void

  /**
   * When true, renders without the outer container (for embedding inside another dropdown).
   */
  inline?: boolean
}

/**
 * Autocomplete dropdown component for displaying place predictions.
 *
 * @param props - Component props
 * @returns Autocomplete dropdown UI
 */
export function AutocompleteDropdown(props: AutocompleteDropdownProps) {
  const content = () => (
    <>
      <Show
        when={!props.loading() && props.predictions().length === 0}
        fallback={
          <Show when={props.loading()}>
            <div class="px-4 py-3 text-sm text-muted-foreground">
              A carregar...
            </div>
          </Show>
        }
      >
        {/* Only show "no results" when not inline (inline mode has waste type suggestions above) */}
        <Show when={!props.inline}>
          <div class="px-4 py-3 text-sm text-muted-foreground">
            Nenhum resultado encontrado
          </div>
        </Show>
      </Show>

      <Show when={props.predictions().length > 0}>
        <Show when={props.inline}>
          <div class="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Locais
          </div>
        </Show>
        <ul class="py-1">
          <For each={props.predictions()}>
            {(prediction) => (
              <li>
                <button
                  type="button"
                  class="w-full px-4 py-3 text-left hover:bg-base-500 transition-colors"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onClick={() => props.onSelectPrediction(prediction)}
                >
                  <div class="flex flex-col">
                    <span class="font-medium text-sm text-base-content">
                      {prediction.structured_formatting.main_text}
                    </span>
                    <span class="text-xs text-muted-foreground">
                      {prediction.structured_formatting.secondary_text}
                    </span>
                  </div>
                </button>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </>
  )

  return (
    <Show when={props.isOpen() && props.query().length > 0}>
      <Show
        when={props.inline}
        fallback={
          <div class="absolute top-full left-0 right-0 mt-2 bg-base-50 border border-base-300 rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
            {content()}
          </div>
        }
      >
        {content()}
      </Show>
    </Show>
  )
}
