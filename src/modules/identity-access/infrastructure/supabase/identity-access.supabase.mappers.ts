import type { Session } from '@supabase/supabase-js'

import type { AuthSessionEntity } from '../../domain/auth-session.entity'

export function supabaseSessionToAuthSessionEntity(
  session: Session,
): AuthSessionEntity {
  return {
    userId: session.user.id,
    email: session.user.email ?? null,
    accessToken: session.access_token,
    metadata:
      typeof session.user.user_metadata === 'object' &&
      session.user.user_metadata !== null
        ? (session.user.user_metadata as Record<string, unknown>)
        : {},
  }
}
