import { createClient } from '@supabase/supabase-js'

import { Database } from '~/shared/infrastructure/supabase/database.types'
import { env } from '~/utils/env'

export const supabase = createClient<Database>(
  env.VITE_PUBLIC_SUPABASE_URL,
  env.VITE_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
      storage: typeof localStorage !== 'undefined' ? localStorage : undefined,
    },
  },
)
