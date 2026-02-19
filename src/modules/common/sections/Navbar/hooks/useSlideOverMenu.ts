import type { Accessor } from 'solid-js'
import { createEffect, createSignal, onCleanup } from 'solid-js'

/**
 * Hook to manage slide-over menu state with outside click detection
 * @param menuRef - Reference to the menu element
 * @returns Open state signal and setter
 */
export function useSlideOverMenu(
  menuRef: Accessor<HTMLDivElement | undefined>,
) {
  const [open, setOpen] = createSignal(false)

  createEffect(() => {
    if (!open()) return

    const onDocClick = (ev: MouseEvent) => {
      const target = ev.target as Node | null
      const ref = menuRef()
      if (ref && target && !ref.contains(target)) {
        setOpen(false)
      }
    }

    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onKey)

    onCleanup(() => {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onKey)
    })
  })

  return { open, setOpen }
}
