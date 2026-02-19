import { CLOSE_ICON_PATH, HAMBURGER_ICON_PATH } from '../constants'

interface HamburgerButtonProps {
  onClick: (e: MouseEvent) => void
  isOpen: boolean
}

/**
 * Hamburger menu button component
 */
export function HamburgerButton(props: HamburgerButtonProps) {
  return (
    <div class="md:hidden">
      <button
        aria-label="Abrir menu"
        aria-expanded={props.isOpen}
        onClick={(e) => props.onClick(e)}
        class="p-2 rounded-lg bg-base-200 hover:bg-base-300/60 active:scale-95 active:opacity-90 transition-transform duration-150"
      >
        <svg
          class="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d={HAMBURGER_ICON_PATH}
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  )
}

interface CloseButtonProps {
  onClick: () => void
}

/**
 * Close button component for mobile menu
 */
export function CloseButton(props: CloseButtonProps) {
  return (
    <button
      aria-label="Fechar menu"
      onClick={() => props.onClick()}
      class="p-2 rounded-md active:scale-95 active:opacity-90 transition-transform duration-150"
    >
      <svg
        class="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d={CLOSE_ICON_PATH}
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  )
}
