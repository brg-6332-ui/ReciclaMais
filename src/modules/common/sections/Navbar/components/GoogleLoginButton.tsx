import { A } from '@solidjs/router'
import { LogInIcon, LogOut as LogOutIcon, User as UserIcon } from 'lucide-solid'
import { createSignal, Show } from 'solid-js'

import { authActions } from '~/modules/auth/application/authActions'
import { useAuthState } from '~/modules/auth/application/authState'
import { openConfirmModal } from '~/modules/modal/helpers/modalHelpers'

import { useSlideOverMenu } from '../hooks/useSlideOverMenu'
import { UserAvatar } from './UserAvatar'

interface GoogleLoginButtonProps {
  text?: string
  textClass?: string
}

/**
 * Google login button component with user menu
 * Shows login button when not authenticated, user avatar with dropdown when authenticated
 */
export function GoogleLoginButton(props: GoogleLoginButtonProps) {
  const { authState } = useAuthState()

  const isAuthenticated = () => authState().isAuthenticated

  const avatarUrl = () => {
    const state = authState()
    if (!state.isAuthenticated) return undefined
    const metadata = state.session?.user.user_metadata
    return (
      (metadata?.avatar_url as string | undefined) ||
      (metadata?.picture as string | undefined) ||
      undefined
    )
  }

  const [menuRef, setMenuRef] = createSignal<HTMLDivElement>()
  const { open, setOpen } = useSlideOverMenu(menuRef)

  const toggleMenu = (e: MouseEvent) => {
    e.preventDefault()
    setOpen((p) => !p)
  }

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
              class="h-10 w-10 rounded-full flex items-center justify-center shadow-sm active:scale-95 active:opacity-90 transition-transform duration-150"
              aria-hidden="false"
              role="img"
            >
              <LogInIcon />
              <span class="sr-only">Entrar</span>
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
            <UserAvatar
              avatarUrl={avatarUrl()}
              size={props.text ? 'small' : 'large'}
            />
            {props.text && (
              <span class={props.textClass ?? ''}>{props.text}</span>
            )}
            {!props.text && <span class="sr-only">Conta</span>}
          </button>
          <Show when={open()}>
            <div
              ref={setMenuRef}
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
