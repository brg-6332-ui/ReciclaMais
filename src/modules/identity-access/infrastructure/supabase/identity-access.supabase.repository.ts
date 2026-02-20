import { supabase } from '~/shared/infrastructure/supabase/supabase'
import { InfrastructureError } from '~/shared/kernel/errors'

import type {
  IdentityAccessRepository,
  SignInWithEmailCommand,
  SignUpWithEmailCommand,
} from '../../application/identity-access.repository'
import type { UserProfileEntity } from '../../domain/user-profile.entity'
import { supabaseSessionToAuthSessionEntity } from './identity-access.supabase.mappers'

export function createIdentityAccessSupabaseRepository(): IdentityAccessRepository {
  return {
    async getCurrentSession() {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        throw new InfrastructureError(
          error.message,
          'IDENTITY_GET_SESSION_FAILED',
          error,
        )
      }

      return data.session
        ? supabaseSessionToAuthSessionEntity(data.session)
        : null
    },

    onAuthStateChange(listener) {
      const { data } = supabase.auth.onAuthStateChange((_, session) => {
        listener(session ? supabaseSessionToAuthSessionEntity(session) : null)
      })

      return {
        unsubscribe: () => {
          data.subscription.unsubscribe()
        },
      }
    },

    async signInWithGoogle() {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      })

      if (error || !data.url) {
        throw new InfrastructureError(
          error?.message ?? 'Could not start Google sign-in',
          'IDENTITY_SIGN_IN_GOOGLE_FAILED',
          error,
        )
      }

      return { url: data.url }
    },

    async signInWithEmail(command: SignInWithEmailCommand) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: command.email,
        password: command.password,
      })

      if (error) {
        throw new InfrastructureError(
          error.message,
          'IDENTITY_SIGN_IN_EMAIL_FAILED',
          error,
        )
      }

      return data.session
        ? supabaseSessionToAuthSessionEntity(data.session)
        : null
    },

    async signUpWithEmail(command: SignUpWithEmailCommand) {
      const { error } = await supabase.auth.signUp({
        email: command.email,
        password: command.password,
        options: command.redirectTo
          ? { emailRedirectTo: command.redirectTo }
          : undefined,
      })

      if (error) {
        throw new InfrastructureError(
          error.message,
          'IDENTITY_SIGN_UP_EMAIL_FAILED',
          error,
        )
      }
    },

    async signOut() {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw new InfrastructureError(
          error.message,
          'IDENTITY_SIGN_OUT_FAILED',
          error,
        )
      }
    },

    async updateProfile(profile: UserProfileEntity) {
      const { error } = await supabase.auth.updateUser({
        data: {
          name: profile.name,
          avatar_url: profile.avatarUrl,
        },
      })

      if (error) {
        throw new InfrastructureError(
          error.message,
          'IDENTITY_UPDATE_PROFILE_FAILED',
          error,
        )
      }
    },
  }
}
