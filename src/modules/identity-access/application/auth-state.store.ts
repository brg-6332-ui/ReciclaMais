import { createSignal } from 'solid-js'

import { identityAccessFacade } from '~/modules/identity-access/identity-access.facade'

import type { AuthStateEntity } from '../domain/auth-session.entity'

const [authState, setAuthState] = createSignal<AuthStateEntity>({
  isAuthenticated: false,
})

let initialized = false
let unsubscribe: (() => void) | null = null

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

  const subscription = identityAccessFacade.onAuthStateChange((session) => {
    setAuthState(toAuthState(session))
  })

  unsubscribe = () => {
    subscription.unsubscribe()
  }
}

export function disposeIdentityAuthState() {
  unsubscribe?.()
  unsubscribe = null
  initialized = false
}

export function useIdentityAuthState() {
  return {
    authState,
  }
}
