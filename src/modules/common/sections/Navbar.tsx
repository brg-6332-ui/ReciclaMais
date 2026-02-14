import { A, useLocation } from '@solidjs/router'
import {
  BookOpenIcon,
  InfoIcon,
  LogInIcon,
  LogOut as LogOutIcon,
  MapPinIcon,
  RecycleIcon,
  User as UserIcon,
} from 'lucide-solid'
import { createEffect, createSignal, onCleanup, onMount, Show } from 'solid-js'

import logo from '~/assets/logo2.png'
import SlideOver from '~/components/ui/SlideOver'
import { authActions } from '~/modules/auth/application/authActions'
import { useAuthState } from '~/modules/auth/application/authState'
import { SearchPill } from '~/modules/common/sections/SearchPill/SearchPill'
import { mapActions } from '~/modules/map/application/mapActions'
// search and map actions are not used in this component
import { openConfirmModal } from '~/modules/modal/helpers/modalHelpers'
import { ThemeSwapButton } from '~/modules/theme/ui/ThemeSwapButton'

export function Navbar() {
  const location = useLocation()

  const { authState } = useAuthState()

  const isActive = (path: string) => location.pathname === path
  const [mobileOpen, setMobileOpen] = createSignal(false)
  let mobileMenuRef: HTMLDivElement | undefined
  const [compactSearch, setCompactSearch] = createSignal(false)

  onMount(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(max-width: 442px)')
    const listener = (ev: MediaQueryListEvent | MediaQueryList) => {
      // ev may be a MediaQueryListEvent or MediaQueryList depending on browser
      const matches = 'matches' in ev ? ev.matches : mq.matches
      setCompactSearch(!!matches)
    }
    // set initial
    setCompactSearch(mq.matches)
    if (mq.addEventListener) mq.addEventListener('change', listener)
    else mq.addListener(listener)
    onCleanup(() => {
      if (mq.removeEventListener) mq.removeEventListener('change', listener)
      else mq.removeListener(listener)
    })
  })

  // close mobile menu on outside click or Esc
  createEffect(() => {
    if (!mobileOpen()) return
    const onDocClick = (ev: MouseEvent) => {
      const target = ev.target as Node | null
      if (mobileMenuRef && target && !mobileMenuRef.contains(target)) {
        setMobileOpen(false)
      }
    }
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onKey)
    onCleanup(() => {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onKey)
    })
  })

  return (
    <header class="bg-base-50/60 backdrop-blur-sm sticky top-0 z-40">
      <div class="container mx-auto px-4 py-3">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="flex-shrink-0">
              <Logo />
            </div>

            {/* Desktop nav icons (kept left of the centered search) */}
            <div class="hidden md:flex justify-between gap-3">
              <A
                href="/"
                title="Início"
                aria-current={isActive('/') ? 'page' : undefined}
                class={`flex-1 text-center justify-items-center rounded-lg p-2 px-3 transition duration-150 ease-in-out transform ${
                  isActive('/')
                    ? 'bg-primary-300'
                    : 'bg-transparent hover:bg-primary-200/30 hover:scale-105 active:scale-95'
                }`}
              >
                <RecycleIcon class="h-4 w-4" />
              </A>

              <A
                href="/collection-points"
                title="Pontos de Recolha"
                aria-current={
                  isActive('/collection-points') ? 'page' : undefined
                }
                class={`flex-1 text-center justify-items-center rounded-lg p-2 px-3 transition duration-150 ease-in-out transform ${
                  isActive('/collection-points')
                    ? 'bg-primary-300'
                    : 'bg-transparent hover:bg-primary-200/30 hover:scale-105 active:scale-95'
                }`}
              >
                <MapPinIcon class="h-4 w-4" />
              </A>

              <A
                href="/recycling-guide"
                title="Guia de Reciclagem"
                aria-current={isActive('/recycling-guide') ? 'page' : undefined}
                class={`flex-1 text-center justify-items-center rounded-lg p-2 px-3 transition duration-150 ease-in-out transform ${
                  isActive('/recycling-guide')
                    ? 'bg-primary-300'
                    : 'bg-transparent hover:bg-primary-200/30 hover:scale-105 active:scale-95'
                }`}
              >
                <BookOpenIcon class="h-4 w-4" />
              </A>

              <A
                href="/about"
                title="Sobre"
                aria-current={isActive('/about') ? 'page' : undefined}
                class={`flex-1 text-center justify-items-center rounded-lg p-2 px-3 transition duration-150 ease-in-out transform ${
                  isActive('/about')
                    ? 'bg-primary-300'
                    : 'bg-transparent hover:bg-primary-200/30 hover:scale-105 active:scale-95'
                }`}
              >
                <InfoIcon class="h-4 w-4" />
              </A>
            </div>
          </div>

          {/* Centered SearchPill */}
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
            {/* hamburger visible only on mobile */}
            <div class="md:hidden">
              <button
                aria-label="Abrir menu"
                aria-expanded={mobileOpen()}
                onClick={(e) => {
                  e.preventDefault()
                  setMobileOpen(true)
                }}
                class="p-2 rounded-lg bg-base-200 hover:bg-base-300/60 active:scale-95 active:opacity-90 transition-transform duration-150"
              >
                <svg
                  class="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 6h16M4 12h16M4 18h16"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* desktop actions */}
            <div class="hidden md:flex items-center gap-6">
              {/* Dashboard icon shown on the right side when user is authenticated */}
              <Show
                when={
                  authState().isAuthenticated && authState().session !== null
                }
              >
                <A
                  href="/dashboard"
                  title="Painel"
                  aria-current={isActive('/dashboard') ? 'page' : undefined}
                  class={`rounded-lg p-2 px-3 transition duration-150 ease-in-out transform ${
                    isActive('/dashboard')
                      ? 'bg-primary-300'
                      : 'bg-transparent hover:bg-primary-200/30 hover:scale-105 active:scale-95'
                  }`}
                >
                  {/* simple dashboard/grid icon */}
                  <svg
                    class="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="8"
                      height="8"
                      stroke="currentColor"
                      stroke-width="1.5"
                      rx="1"
                    />
                    <rect
                      x="13"
                      y="3"
                      width="8"
                      height="8"
                      stroke="currentColor"
                      stroke-width="1.5"
                      rx="1"
                    />
                    <rect
                      x="3"
                      y="13"
                      width="8"
                      height="8"
                      stroke="currentColor"
                      stroke-width="1.5"
                      rx="1"
                    />
                    <rect
                      x="13"
                      y="13"
                      width="8"
                      height="8"
                      stroke="currentColor"
                      stroke-width="1.5"
                      rx="1"
                    />
                  </svg>
                </A>
              </Show>
              <div class="active:scale-95 active:opacity-90 transition-transform duration-150">
                <ThemeSwapButton />
              </div>
              <div class="active:scale-95 active:opacity-90 transition-transform duration-150">
                <GoogleLoginButton />
              </div>
            </div>
          </div>
        </div>
      </div>

      <SlideOver
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        widthClass="w-72"
        slideDuration={250}
        backdropDuration={250}
      >
        <div class="h-full bg-base-50/95 text-base-content backdrop-blur-sm flex flex-col pointer-events-auto">
          <div class="p-4 flex items-center justify-between">
            <A href="/" class="flex items-center gap-3 select-none">
              <img src={logo} alt="Recicla+" class="h-8" />
            </A>
            <button
              aria-label="Fechar menu"
              onClick={() => setMobileOpen(false)}
              class="p-2 rounded-md active:scale-95 active:opacity-90 transition-transform duration-150"
            >
              <svg
                class="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 18L18 6M6 6l12 12"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>

          <nav class="px-4 mt-4">
            <A
              href="/"
              onClick={() => setMobileOpen(false)}
              class="flex items-center gap-3 px-3 py-2 rounded-md text-base-content hover:bg-base-200 active:scale-95 active:opacity-90 transition-transform duration-150"
            >
              <RecycleIcon class="h-5 w-5" />
              <span>Início</span>
            </A>
            <A
              href="/collection-points"
              onClick={() => setMobileOpen(false)}
              class="flex items-center gap-3 px-3 py-2 rounded-md text-base-content hover:bg-base-200 active:scale-95 active:opacity-90 transition-transform duration-150"
            >
              <MapPinIcon class="h-5 w-5" />
              <span>Pontos de Recolha</span>
            </A>
            <A
              href="/recycling-guide"
              onClick={() => setMobileOpen(false)}
              class="flex items-center gap-3 px-3 py-2 rounded-md text-base-content hover:bg-base-200 active:scale-95 active:opacity-90 transition-transform duration-150"
            >
              <BookOpenIcon class="h-5 w-5" />
              <span>Guia de Reciclagem</span>
            </A>
            <A
              href="/about"
              onClick={() => setMobileOpen(false)}
              class="flex items-center gap-3 px-3 py-2 rounded-md text-base-content hover:bg-base-200 active:scale-95 active:opacity-90 transition-transform duration-150"
            >
              <InfoIcon class="h-5 w-5" />
              <span>Sobre</span>
            </A>
            <Show when={() => authState().isAuthenticated}>
              <A
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                class="flex items-center gap-3 px-3 py-2 rounded-md text-base-content hover:bg-base-200 active:scale-95 active:opacity-90 transition-transform duration-150"
              >
                <svg
                  class="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="3"
                    y="3"
                    width="8"
                    height="8"
                    stroke="currentColor"
                    stroke-width="1.5"
                    rx="1"
                  />
                  <rect
                    x="13"
                    y="3"
                    width="8"
                    height="8"
                    stroke="currentColor"
                    stroke-width="1.5"
                    rx="1"
                  />
                  <rect
                    x="3"
                    y="13"
                    width="8"
                    height="8"
                    stroke="currentColor"
                    stroke-width="1.5"
                    rx="1"
                  />
                  <rect
                    x="13"
                    y="13"
                    width="8"
                    height="8"
                    stroke="currentColor"
                    stroke-width="1.5"
                    rx="1"
                  />
                </svg>
                <span>Painel</span>
              </A>
            </Show>
          </nav>

          <div class="mt-6 px-4">
            <div class="mb-4">
              <div class="flex items-center gap-3 ">
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
    </header>
  )
}

function Logo() {
  return (
    <div class="rounded-full bg-base-400/20 overflow-clip p-1 ">
      <A href="/" class="flex items-center gap-3 select-none">
        <img src={logo} alt="Recicla+" class="h-10" />
      </A>
    </div>
  )
}

function GoogleLoginButton(props: { text?: string; textClass?: string } = {}) {
  const { authState } = useAuthState()

  const isAuthenticated = () => authState().isAuthenticated

  const avatarUrl = () => {
    const state = authState()
    if (!state.isAuthenticated) return undefined
    const metadata = state.session?.user.user_metadata as
      | Record<string, unknown>
      | undefined
    return (
      (metadata?.avatar_url as string | undefined) ||
      (metadata?.picture as string | undefined) ||
      undefined
    )
  }

  const [open, setOpen] = createSignal(false)
  let menuRef: HTMLDivElement | undefined

  const toggleMenu = (e: MouseEvent) => {
    e.preventDefault()
    setOpen((p) => !p)
  }

  createEffect(() => {
    if (!open()) return
    const onDocClick = (ev: MouseEvent) => {
      const target = ev.target as Node | null
      if (menuRef && target && !menuRef.contains(target)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', onDocClick)
    onCleanup(() => document.removeEventListener('click', onDocClick))
  })

  const handleLogout = (e: MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    openConfirmModal('Tem a certeza que pretende sair da sua conta?', {
      title: 'Confirmação de Logout',
      onConfirm: () =>
        void authActions.logout().catch((error) => {
          alert(
            `Erro ao sair: ${
              error instanceof Error ? error.message : String(error)
            }`,
          )
        }),
    })
  }

  return (
    <div class="flex items-center gap-3">
      <Show
        when={isAuthenticated()}
        fallback={
          <A href="/auth" class="flex items-center gap-3">
            <div
              class="h-10 w-10 rounded-full flex items-center justify-center   shadow-sm active:scale-95 active:opacity-90 transition-transform duration-150"
              aria-hidden="false"
              role="img"
            >
              <LogInIcon />
              <span class="sr-only">Entrar </span>
            </div>
            {props.text && (
              <span class={props.textClass ?? ''}>{props.text}</span>
            )}
          </A>
        }
      >
        <div class="relative">
          <button
            onClick={toggleMenu}
            aria-expanded={open()}
            class={`h-10 rounded-full overflow-hidden bg-base-500 border border-base-300 shadow-sm active:scale-95 active:opacity-90 transition-transform duration-150 ${props.text ? 'flex items-center gap-3 px-2' : 'w-10'}`}
            title="Conta"
          >
            {avatarUrl() ? (
              props.text ? (
                <img
                  src={avatarUrl()}
                  alt="User avatar"
                  class="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <img
                  src={avatarUrl()}
                  alt="User avatar"
                  class="h-full w-full object-cover"
                />
              )
            ) : props.text ? (
              <>
                <svg
                  class="h-5 w-5 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z"
                    stroke="#9CA3AF"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M20 21v-1c0-2.761-4.03-5-8-5s-8 2.239-8 5v1"
                    stroke="#9CA3AF"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span class={props.textClass ?? ''}>{props.text}</span>
              </>
            ) : (
              <svg
                class="h-5 w-5 m-auto text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z"
                  stroke="#9CA3AF"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M20 21v-1c0-2.761-4.03-5-8-5s-8 2.239-8 5v1"
                  stroke="#9CA3AF"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            )}
            {!props.text && <span class="sr-only">Conta</span>}
          </button>
          <Show when={open()}>
            <div
              ref={(el) => (menuRef = el)}
              class="absolute right-0 mt-2 w-44 bg-base-50 border border-base-200 rounded-lg shadow-lg overflow-hidden z-50 ring-1 ring-base-200"
            >
              <A
                href="/dashboard"
                class="flex items-center gap-3 px-4 py-3 text-sm text-base-content hover:bg-base-200 transition-colors duration-150"
              >
                <UserIcon class="h-4 w-4 text-muted-foreground" />
                <span>Painel</span>
              </A>
              <button
                onClick={handleLogout}
                class="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-base-content hover:bg-base-200 transition-colors duration-150"
              >
                <LogOutIcon class="h-4 w-4 text-muted-foreground" />
                <span>Sair</span>
              </button>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  )
}
