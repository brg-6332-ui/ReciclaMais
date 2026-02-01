import { Session } from '@supabase/supabase-js'
import { createRoot, createSignal, onMount } from 'solid-js'

import { supabase } from '~/shared/infrastructure/supabase/supabase'

export type AuthState =
  | {
      isAuthenticated: true
      session: Session
    }
  | {
      isAuthenticated: false
      session?: undefined
    }

const authStateObj = createRoot(() => {
  const [authState, setAuthState] = createSignal<AuthState>({
    isAuthenticated: false,
  })

  onMount(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setAuthState(
          session
            ? { isAuthenticated: true, session }
            : { isAuthenticated: false },
        )
      },
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  })

  return { authState }
})

export const useAuthState = () => authStateObj
