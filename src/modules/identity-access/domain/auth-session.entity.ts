export type AuthSessionEntity = {
  userId: string
  email: string | null
  accessToken: string | null
  metadata: Record<string, unknown>
}

export type AuthStateEntity =
  | {
      isAuthenticated: true
      session: AuthSessionEntity
    }
  | {
      isAuthenticated: false
      session?: undefined
    }
