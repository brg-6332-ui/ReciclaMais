import type { AuthSessionEntity } from '../domain/auth-session.entity'
import type { UserProfileEntity } from '../domain/user-profile.entity'

export type SignInWithEmailCommand = {
  email: string
  password: string
}

export type SignUpWithEmailCommand = {
  email: string
  password: string
  redirectTo?: string
}

export interface IdentityAccessRepository {
  getCurrentSession(): Promise<AuthSessionEntity | null>
  onAuthStateChange(listener: (session: AuthSessionEntity | null) => void): {
    unsubscribe: () => void
  }
  signInWithGoogle(): Promise<{ url: string }>
  signInWithEmail(
    command: SignInWithEmailCommand,
  ): Promise<AuthSessionEntity | null>
  signUpWithEmail(command: SignUpWithEmailCommand): Promise<void>
  signOut(): Promise<void>
  updateProfile(profile: UserProfileEntity): Promise<void>
}
