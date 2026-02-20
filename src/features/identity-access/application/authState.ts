import { useIdentityAuthState } from '~/features/identity-access/state/auth-state.store'

export type LegacySession = {
  user: {
    id: string
    email?: string
    user_metadata?: Record<string, unknown>
  }
  access_token?: string
}

export type AuthState =
  | {
      isAuthenticated: true
      session: LegacySession
    }
  | {
      isAuthenticated: false
      session?: undefined
    }

export const useAuthState = () => {
  const identity = useIdentityAuthState()

  const authState = (): AuthState => {
    const state = identity.authState()

    if (!state.isAuthenticated) {
      return { isAuthenticated: false }
    }

    return {
      isAuthenticated: true,
      session: {
        user: {
          id: state.session.userId,
          email: state.session.email ?? undefined,
          user_metadata: state.session.metadata,
        },
        access_token: state.session.accessToken ?? undefined,
      },
    }
  }

  return { authState }
}
