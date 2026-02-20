import { createIdentityAccessFacade } from '../../application/identity-access.facade'
import { createIdentityAccessSupabaseRepository } from '../supabase/identity-access.supabase.repository'

export function createIdentityAccessBootstrap() {
  const repository = createIdentityAccessSupabaseRepository()
  const facade = createIdentityAccessFacade(repository)

  return {
    repository,
    facade,
  }
}
