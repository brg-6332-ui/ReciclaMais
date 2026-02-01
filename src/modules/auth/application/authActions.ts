import { supabase } from '~/shared/infrastructure/supabase/supabase'

export const authActions = {
  loginWithGoogle: async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
  },
  logout: async () => {
    await supabase.auth.signOut()
  },
}
