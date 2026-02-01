import { Accessor, createEffect, JSX, onCleanup } from 'solid-js'
import { Portal } from 'solid-js/web'

type SlideOverProps = {
  open: Accessor<boolean>
  onClose?: () => void
  widthClass?: string
  children?: JSX.Element
  /** transition duration for panel (ms) */
  slideDuration?: number
  /** transition duration for backdrop (ms) */
  backdropDuration?: number
}

export function SlideOver(props: SlideOverProps) {
  createEffect(() => {
    if (!props.open()) return
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') props.onClose?.()
    }
    document.addEventListener('keydown', onKey)
    onCleanup(() => document.removeEventListener('keydown', onKey))
  })

  return (
    <Portal>
      <div
        class={`fixed inset-0 z-50 md:hidden ${props.open() ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!props.open()}
      >
        <div
          class={`absolute inset-0 bg-black transition-opacity ease-in-out ${props.open() ? 'opacity-10' : 'opacity-0'} z-40`}
          style={`transition-duration: ${props.backdropDuration ?? 250}ms;`}
          onClick={() => props.onClose?.()}
        />

        <div
          class={`absolute right-0 top-0 h-full ${props.widthClass ?? 'w-72'} transform z-50 pointer-events-auto`}
          style={`transition-property: transform; transition-timing-function: cubic-bezier(.22,.9,.3,1); transition-duration: ${props.slideDuration ?? 250}ms; transform: ${props.open() ? 'translateX(0%)' : 'translateX(100%)'};`}
        >
          {props.children}
        </div>
      </div>
    </Portal>
  )
}

export default SlideOver
