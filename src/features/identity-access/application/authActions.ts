import { identityAccessFacade } from '~/modules/identity-access/infrastructure/bootstrap/identity-access.facade'

export const authActions = {
  loginWithGoogle: async () => {
    await identityAccessFacade.signInWithGoogle()
  },

  signInWithEmail: async (email: string, password: string) => {
    return await identityAccessFacade.signInWithEmail({ email, password })
  },

  signUpWithEmail: async (
    email: string,
    password: string,
    options?: { redirectTo?: string },
  ) => {
    return await identityAccessFacade.signUpWithEmail({
      email,
      password,
      redirectTo: options?.redirectTo,
    })
  },

  logout: async () => {
    await identityAccessFacade.signOut()
    if (window?.location) {
      window.location.href = '/'
    }
  },

  getCurrentSession: async () => {
    return await identityAccessFacade.getCurrentSession()
  },

  getCurrentAccessToken: async () => {
    return await identityAccessFacade.getCurrentAccessToken()
  },
}
