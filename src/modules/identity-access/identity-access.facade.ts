import { createIdentityAccessBootstrap } from './infrastructure/bootstrap/identity-access.bootstrap'

const bootstrap = createIdentityAccessBootstrap()

export const identityAccessFacade = bootstrap.facade
