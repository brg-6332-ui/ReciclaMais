import { ApplicationError } from '~/shared/kernel/errors'

import { normalizeUserProfile } from '../domain/user-profile.entity'
import type {
  IdentityAccessRepository,
  SignInWithEmailCommand,
  SignUpWithEmailCommand,
} from './identity-access.repository'

export function createIdentityAccessFacade(
  repository: IdentityAccessRepository,
) {
  async function openPopupAndWait(url: string, timeout = 60_000) {
    const popup = window.open(url, 'supabase_oauth', 'width=500,height=700')
    if (!popup) {
      throw new ApplicationError(
        'Não foi possível abrir a janela de autenticação',
        'AUTH_POPUP_BLOCKED',
      )
    }

    const startedAt = Date.now()

    return await new Promise<void>((resolve, reject) => {
      const timer = window.setInterval(() => {
        void (async () => {
          if (popup.closed) {
            window.clearInterval(timer)

            const session = await repository.getCurrentSession()
            if (session) {
              resolve()
              return
            }

            reject(
              new ApplicationError(
                'Janela de autenticação fechada pelo utilizador',
                'AUTH_POPUP_CLOSED',
              ),
            )
            return
          }

          if (Date.now() - startedAt > timeout) {
            window.clearInterval(timer)
            try {
              popup.close()
            } catch {
              // no-op
            }

            reject(
              new ApplicationError(
                'Tempo de autenticação esgotado',
                'AUTH_POPUP_TIMEOUT',
              ),
            )
          }
        })()
      }, 500)
    })
  }

  return {
    getCurrentSession: async () => await repository.getCurrentSession(),

    onAuthStateChange: (
      listener: Parameters<IdentityAccessRepository['onAuthStateChange']>[0],
    ) => repository.onAuthStateChange(listener),

    signInWithGoogle: async () => {
      const { url } = await repository.signInWithGoogle()
      await openPopupAndWait(url)
    },

    signInWithEmail: async (command: SignInWithEmailCommand) =>
      await repository.signInWithEmail(command),

    signUpWithEmail: async (command: SignUpWithEmailCommand) =>
      await repository.signUpWithEmail(command),

    signOut: async () => {
      await repository.signOut()
    },

    updateProfile: async (command: {
      name: string | null
      avatarUrl: string | null
    }) => {
      const profile = normalizeUserProfile(command)
      await repository.updateProfile(profile)
    },

    getCurrentAccessToken: async () => {
      const session = await repository.getCurrentSession()
      return session?.accessToken ?? null
    },
  }
}
