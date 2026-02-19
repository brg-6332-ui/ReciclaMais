import { createEffect, createSignal, onCleanup } from 'solid-js'

import { COMPACT_SEARCH_BREAKPOINT } from '../constants'

/**
 * Hook to determine if the search should be displayed in compact mode
 * based on viewport width
 */
export function useCompactSearch() {
  const [compactSearch, setCompactSearch] = createSignal(false)

  createEffect(() => {
    if (typeof window === 'undefined') return

    const mq = window.matchMedia(COMPACT_SEARCH_BREAKPOINT)

    const listener = (ev: MediaQueryListEvent | MediaQueryList) => {
      const matches = 'matches' in ev ? ev.matches : mq.matches
      setCompactSearch(!!matches)
    }

    setCompactSearch(mq.matches)

    if (mq.addEventListener) {
      mq.addEventListener('change', listener)
    } else {
      mq.addListener(listener)
    }

    onCleanup(() => {
      if (mq.removeEventListener) {
        mq.removeEventListener('change', listener)
      } else {
        mq.removeListener(listener)
      }
    })
  })

  return compactSearch
}
