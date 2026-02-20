import { createSignal } from 'solid-js'

import { mapActions } from '~/features/map/application/mapActions'
import { SearchPill } from '~/features/shell/sections/SearchPill/SearchPill'

import { DesktopNav, DesktopNavIcons } from './components/DesktopNav'
import { Logo } from './components/Logo'
import { HamburgerButton } from './components/MenuButtons'
import { MobileMenu } from './components/MobileMenu'
import { useCompactSearch } from './hooks/useCompactSearch'

/**
 * Main navigation bar component
 * Displays logo, navigation items, search, and user actions
 * Responsive: shows desktop nav on large screens, mobile menu on small screens
 */
export function Navbar() {
  const [mobileOpen, setMobileOpen] = createSignal(false)
  const compactSearch = useCompactSearch()

  return (
    <header class="bg-base-50/60 backdrop-blur-sm sticky top-0 z-40">
      <div class="container mx-auto px-4 py-3">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="flex-shrink-0">
              <Logo />
            </div>
            <DesktopNavIcons />
          </div>

          <div
            class={`${compactSearch() ? 'flex-none px-0' : 'flex-1 px-4'} flex justify-center`}
          >
            <div class={`w-full ${compactSearch() ? 'max-w-xs' : 'max-w-md'}`}>
              <SearchPill
                compact={compactSearch()}
                onUseLocationClick={mapActions.openMapPageWithCoordinates}
                onPlaceSelected={mapActions.openMapPageWithPlaceId}
                onWasteTypeSelected={mapActions.openMapPageWithWasteType}
              />
            </div>
          </div>

          <div class="flex items-center gap-4">
            <HamburgerButton
              onClick={(e) => {
                e.preventDefault()
                setMobileOpen(true)
              }}
              isOpen={mobileOpen()}
            />

            <DesktopNav />
          </div>
        </div>
      </div>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  )
}
