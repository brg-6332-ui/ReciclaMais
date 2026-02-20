import { createSignal, onCleanup, onMount } from 'solid-js'

/**
 * Returns a signal indicating if the user prefers reduced motion.
 * Listens for changes to the `prefers-reduced-motion` media query.
 */
export function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = createSignal(false)

  onMount(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReduced(mq.matches)

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReduced(e.matches)
    }

    if (mq.addEventListener) {
      mq.addEventListener('change', handler)
    } else {
      mq.addListener(handler)
    }

    onCleanup(() => {
      if (mq.removeEventListener) {
        mq.removeEventListener('change', handler)
      } else {
        mq.removeListener(handler)
      }
    })
  })

  return prefersReduced
}
