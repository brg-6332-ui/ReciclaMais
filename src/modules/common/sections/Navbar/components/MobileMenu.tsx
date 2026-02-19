import { A } from '@solidjs/router'
import type { Accessor } from 'solid-js'
import { For, Show } from 'solid-js'

import logo from '~/assets/logo2.png'
import SlideOver from '~/components/ui/SlideOver'
import { useAuthState } from '~/modules/auth/application/authState'
import { ThemeSwapButton } from '~/modules/theme/ui/ThemeSwapButton'

import { DASHBOARD_ICON_PATH, NAV_ITEMS } from '../constants'
import { GoogleLoginButton } from './GoogleLoginButton'
import { CloseButton } from './MenuButtons'
import { MobileNavLink } from './NavIconButton'

interface MobileMenuProps {
  open: Accessor<boolean>
  onClose: () => void
}

/**
 * Mobile slide-over menu component
 */
export function MobileMenu(props: MobileMenuProps) {
  const { authState } = useAuthState()

  return (
    <SlideOver
      open={props.open}
      onClose={props.onClose}
      widthClass="w-72"
      slideDuration={250}
      backdropDuration={250}
    >
      <div class="h-full bg-base-50/95 text-base-content backdrop-blur-sm flex flex-col pointer-events-auto">
        <div class="p-4 flex items-center justify-between">
          <A href="/" class="flex items-center gap-3 select-none">
            <img src={logo} alt="Recicla+" class="h-8" />
          </A>
          <CloseButton onClick={props.onClose} />
        </div>

        <nav class="px-4 mt-4">
          <For each={NAV_ITEMS}>
            {(item) => (
              <MobileNavLink
                href={item.path}
                icon={item.icon}
                label={item.label}
                onClick={props.onClose}
              />
            )}
          </For>
          <Show when={() => authState().isAuthenticated}>
            <A
              href="/dashboard"
              onClick={props.onClose}
              class="flex items-center gap-3 px-3 py-2 rounded-md text-base-content hover:bg-base-200 active:scale-95 active:opacity-90 transition-transform duration-150"
            >
              <svg
                class="h-5 w-5"
                viewBox={DASHBOARD_ICON_PATH.viewBox}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <For each={DASHBOARD_ICON_PATH.rects}>
                  {(rect) => (
                    <rect
                      x={rect.x}
                      y={rect.y}
                      width={rect.width}
                      height={rect.height}
                      stroke="currentColor"
                      stroke-width="1.5"
                      rx="1"
                    />
                  )}
                </For>
              </svg>
              <span>Painel</span>
            </A>
          </Show>
        </nav>

        <div class="mt-6 px-4">
          <div class="mb-4">
            <div class="flex items-center gap-3">
              <div class="active:scale-95 flex-1 active:opacity-90 transition-transform duration-150">
                <ThemeSwapButton text="Tema" textClass="block" />
              </div>
            </div>
          </div>
          <div>
            <div class="flex items-center gap-3">
              <div class="active:scale-95 active:opacity-90 transition-transform duration-150">
                <GoogleLoginButton text="Conta" textClass="block" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SlideOver>
  )
}
