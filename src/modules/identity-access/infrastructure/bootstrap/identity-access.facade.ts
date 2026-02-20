import { createIdentityAccessBootstrap } from './identity-access.bootstrap'

const bootstrap = createIdentityAccessBootstrap()

export const identityAccessFacade = bootstrap.facade
