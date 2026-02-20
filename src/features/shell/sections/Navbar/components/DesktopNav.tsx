import { useLocation } from '@solidjs/router'
import { For, Show } from 'solid-js'

import { useAuthState } from '~/features/identity-access/application/authState'
import { ThemeSwapButton } from '~/features/theme/ui/ThemeSwapButton'

import { NAV_ITEMS } from '../constants'
import { GoogleLoginButton } from './GoogleLoginButton'
import { DashboardIconButton, NavIconButton } from './NavIconButton'

/**
 * Desktop navigation component with icon buttons
 */
export function DesktopNav() {
  const location = useLocation()
  const { authState } = useAuthState()

  const isActive = (path: string) => location.pathname === path

  return (
    <div class="hidden md:flex items-center gap-6">
      <Show when={authState().isAuthenticated && authState().session !== null}>
        <DashboardIconButton isActive={isActive('/dashboard')} />
      </Show>
      <div class="active:scale-95 active:opacity-90 transition-transform duration-150">
        <ThemeSwapButton />
      </div>
      <div class="active:scale-95 active:opacity-90 transition-transform duration-150">
        <GoogleLoginButton />
      </div>
    </div>
  )
}

/**
 * Desktop navigation icons (left side of search)
 */
export function DesktopNavIcons() {
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path

  return (
    <div class="hidden md:flex justify-between gap-3">
      <For each={NAV_ITEMS}>
        {(item) => (
          <NavIconButton
            href={item.path}
            title={item.title}
            icon={item.icon}
            isActive={isActive(item.path)}
          />
        )}
      </For>
    </div>
  )
}
