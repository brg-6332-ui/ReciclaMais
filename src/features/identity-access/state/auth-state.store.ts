import { createSignal } from 'solid-js'

import type { AuthStateEntity } from '~/modules/identity-access/domain/auth-session.entity'
import { identityAccessFacade } from '~/modules/identity-access/infrastructure/bootstrap/identity-access.facade'

const [authState, setAuthState] = createSignal<AuthStateEntity>({
  isAuthenticated: false,
})

let initialized = false

function toAuthState(
  session: Awaited<ReturnType<typeof identityAccessFacade.getCurrentSession>>,
) {
  if (!session) {
    return { isAuthenticated: false } as const
  }

  return {
    isAuthenticated: true,
    session,
  } as const
}

export function initializeIdentityAuthState() {
  if (initialized || typeof window === 'undefined') {
    return
  }

  initialized = true

  void identityAccessFacade
    .getCurrentSession()
    .then((session) => {
      setAuthState(toAuthState(session))
    })
    .catch(() => {
      setAuthState({ isAuthenticated: false })
    })

  identityAccessFacade.onAuthStateChange((session) => {
    setAuthState(toAuthState(session))
  })
}

export function useIdentityAuthState() {
  return {
    authState,
  }
}
