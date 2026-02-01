const envVars = [
  'VITE_GOOGLE_MAPS_API_KEY',
  'VITE_GOOGLE_MAPS_MAP_ID',
  'VITE_PUBLIC_SUPABASE_ANON_KEY',
  'VITE_PUBLIC_SUPABASE_URL',
] as const

export function validateEnvVars() {
  envVars.forEach((varName) => {
    if (!import.meta.env[varName]) {
      console.error(`${varName} is not defined in environment variables`)
      throw new Error(`${varName} is not defined in environment variables`)
    }
  })
}

export const env: Record<(typeof envVars)[number], string> = {
  VITE_GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!,
  VITE_GOOGLE_MAPS_MAP_ID: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID!,
  VITE_PUBLIC_SUPABASE_ANON_KEY: import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY!,
  VITE_PUBLIC_SUPABASE_URL: import.meta.env.VITE_PUBLIC_SUPABASE_URL!,
}
