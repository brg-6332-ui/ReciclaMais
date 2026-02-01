import {
  Crosshair as CrosshairIcon,
  Loader2,
  Search as SearchIcon,
} from 'lucide-solid'
import { type Accessor, createMemo, Show } from 'solid-js'

/**
 * Props for the SearchInput component.
 */
export type SearchInputProps = {
  /**
   * Current search query value.
   */
  value: Accessor<string>

  /**
   * Callback fired when the input value changes.
   */
  onInput: (value: string) => void

  /**
   * Callback fired when the input is focused.
   */
  onFocus: () => void

  /**
   * Callback fired when the input loses focus.
   */
  onBlur: () => void

  /**
   * Callback fired when the "use my location" button is clicked.
   */
  onUseLocationClick?: () => void

  /**
   * Callback fired when the search button is clicked.
   */
  onSearch?: (query: string) => void

  /**
   * Ref callback for the input element.
   */
  ref?: (element: HTMLInputElement) => void
  /**
   * When true, renders a compact variant suitable for very small widths
   */
  compact?: boolean

  /** When true, show a loading indicator for the location button */
  loading?: Accessor<boolean>

  /**
   * Optional placeholder override
   */
  placeholder?: string
}

/**
 * Search input component with location and search buttons.
 *
 * @param props - Component props
 * @returns Search input UI
 */
export function SearchInput(props: SearchInputProps) {
  const isCompact = createMemo(() => !!props.compact)
  const placeholder = createMemo(
    () =>
      props.placeholder ??
      (isCompact() ? 'Pesquisar' : 'Pesquisar pontos de recolha'),
  )

  return (
    <div class="flex items-center h-10 bg-base-50 border border-base-300 rounded-full px-3 shadow-sm">
      {/* keep a constant height (h-10) so input never shrinks vertically; compact only adjusts icon/text sizes */}
      <button
        class={`p-1 rounded-full hover:bg-base-400 text-muted-foreground ${isCompact() ? 'mr-1' : 'mr-2'}`}
        onClick={() => props.onUseLocationClick?.()}
        aria-label="Use my location"
        title="Usar minha localização"
        disabled={
          !props.onUseLocationClick || (props.loading ? props.loading() : false)
        }
        aria-busy={props.loading ? props.loading() : false}
      >
        <Show
          when={props.loading ? props.loading() : false}
          fallback={
            <CrosshairIcon class={`${isCompact() ? 'h-4 w-4' : 'h-4 w-4'}`} />
          }
        >
          <Loader2
            class={`${isCompact() ? 'h-4 w-4' : 'h-4 w-4'} animate-spin`}
          />
        </Show>
      </button>
      <input
        ref={(r) => props.ref?.(r)}
        value={props.value()}
        onInput={(e) => props.onInput(e.currentTarget.value)}
        onFocus={() => props.onFocus()}
        onBlur={() => props.onBlur()}
        placeholder={placeholder()}
        class={`outline-none bg-transparent ${isCompact() ? 'text-xs' : 'text-sm'} flex-1 h-full leading-none`}
      />
      <Show when={props.onSearch}>
        <button
          class={`ml-3 bg-primary-500 text-black rounded-full ${isCompact() ? 'p-1' : 'p-2'} hover:opacity-95`}
          onClick={() => props.onSearch?.(props.value())}
          aria-label="search"
        >
          <SearchIcon class={`${isCompact() ? 'h-4 w-4' : 'h-4 w-4'}`} />
        </button>
      </Show>
    </div>
  )
}
