import { createClient } from '@supabase/supabase-js'

import type { Database } from '~/shared/infrastructure/supabase/database.types'
import { env } from '~/utils/env'

function readHeader(request: Request | undefined, name: string): string | null {
  if (!request) return null

  const headers = (request as unknown as { headers?: unknown }).headers
  if (!headers) return null

  if (typeof (headers as Headers).get === 'function') {
    try {
      return (headers as Headers).get(name) ?? null
    } catch {
      return null
    }
  }

  if (typeof headers === 'object' && headers !== null) {
    const record = headers as Record<string, unknown>
    const value = record[name] ?? record[name.toLowerCase()]
    return typeof value === 'string' ? value : null
  }

  return null
}

export function createServerSupabaseClient(request?: Request) {
  const authorizationHeader = readHeader(request, 'Authorization')
  const cookieHeader = readHeader(request, 'cookie')

  const forwardedHeaders: Record<string, string> = {}
  if (authorizationHeader) forwardedHeaders.Authorization = authorizationHeader
  if (cookieHeader) forwardedHeaders.Cookie = cookieHeader

  return createClient<Database>(
    env.VITE_PUBLIC_SUPABASE_URL,
    env.VITE_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: forwardedHeaders,
      },
    },
  )
}
