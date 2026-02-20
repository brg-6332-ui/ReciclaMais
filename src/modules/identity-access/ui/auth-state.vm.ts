import type { AuthStateResponseDTO } from '../interface/http/identity-access.responses'

export type AuthStateVM = {
  isAuthenticated: boolean
  userDisplayName: string
}

export function authStateResponseToVM(dto: AuthStateResponseDTO): AuthStateVM {
  return {
    isAuthenticated: dto.isAuthenticated,
    userDisplayName: dto.email?.split('@')[0] ?? 'Visitante',
  }
}
