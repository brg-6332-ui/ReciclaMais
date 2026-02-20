import { type Accessor, createSignal, onCleanup } from 'solid-js'

/**
 * Creates a debounced version of a value that updates after a specified delay.
 *
 * @param initialValue - Initial value for the debounced signal
 * @param delay - Delay in milliseconds before updating the debounced value
 * @returns Tuple of [debouncedValue accessor, setValue function]
 *
 * @example
 * const [debouncedQuery, setQuery] = useDebouncedValue('', 300)
 * setQuery('search term') // debouncedQuery() updates after 300ms
 */
export function useDebouncedValue<T>(
  initialValue: T,
  delay: number,
): readonly [Accessor<T>, (value: T) => void] {
  const [debouncedValue, setDebouncedValue] = createSignal<T>(initialValue)

  let timeoutId: number | undefined

  const setValueWithDebounce = (newValue: T) => {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId)
    }

    timeoutId = window.setTimeout(() => {
      setDebouncedValue(() => newValue)
    }, delay)
  }

  onCleanup(() => {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId)
    }
  })

  return [debouncedValue, setValueWithDebounce] as const
}
