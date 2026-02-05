import { supabase } from '~/shared/infrastructure/supabase/supabase'

async function openPopupAndWait(url: string, timeout = 60_000) {
  const popup = window.open(url, 'supabase_oauth', 'width=500,height=700')
  if (!popup) throw new Error('Não foi possível abrir a janela de autenticação')

  const start = Date.now()
  return new Promise<void>((resolve, reject) => {
    const timer = setInterval(() => {
      void (async () => {
        if (popup.closed) {
          clearInterval(timer)
          // check if session exists
          const { data } = await supabase.auth.getSession()
          if (data?.session) {
            resolve()
          } else {
            reject(new Error('Janela de autenticação fechada pelo utilizador'))
          }
          return
        }
        if (Date.now() - start > timeout) {
          clearInterval(timer)
          try {
            popup.close()
          } catch (err) {
            void err
          }
          reject(new Error('Tempo de autenticação esgotado'))
        }
        // otherwise keep waiting
      })()
    }, 500)
  })
}

export const authActions = {
  loginWithGoogle: async () => {
    // Request an OAuth URL and open it in a popup so we don't force a full-page redirect
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    if (error) throw error
    if (!data?.url)
      throw new Error('Não foi possível iniciar autenticação com Google')
    await openPopupAndWait(data.url)
  },

  signInWithEmail: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  },

  signUpWithEmail: async (
    email: string,
    password: string,
    options?: { redirectTo?: string },
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: options ? { emailRedirectTo: options.redirectTo } : undefined,
    })
    if (error) throw error
    return data
  },

  logout: async () => {
    await supabase.auth.signOut()
    if (window?.location) {
      window.location.href = '/'
    }
  },
}
