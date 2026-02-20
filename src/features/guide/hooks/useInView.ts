import { createSignal, onCleanup, onMount } from 'solid-js'

/**
 * Observes an element's visibility in the viewport via IntersectionObserver.
 * Returns a signal that becomes `true` once the element enters the viewport
 * (and stays true — no re-triggering).
 *
 * @param options.threshold - Visibility ratio to trigger (default 0.15)
 * @param options.rootMargin - Root margin string (default '0px')
 * @returns [inView, setRef] — the boolean signal and a ref-setter callback
 */
export function useInView(options?: {
  threshold?: number
  rootMargin?: string
}) {
  const [inView, setInView] = createSignal(false)
  let el: HTMLElement | null = null

  const setRef = (node: HTMLElement) => {
    el = node
  }

  onMount(() => {
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true)
            obs.unobserve(entry.target)
          }
        }
      },
      {
        threshold: options?.threshold ?? 0.15,
        rootMargin: options?.rootMargin ?? '0px',
      },
    )
    obs.observe(el)
    onCleanup(() => obs.disconnect())
  })

  return { inView, setRef } as const
}
