import { env } from '~/utils/env'

export default function TestEnv() {
  return (
    <main class="">
      <h1>Environment Variables</h1>
      <ul>
        <li>Google Maps API Key: {env.VITE_GOOGLE_MAPS_API_KEY}</li>
        <li>Google Maps Map ID: {env.VITE_GOOGLE_MAPS_MAP_ID}</li>
        <li>Supabase Anon Key: {env.VITE_PUBLIC_SUPABASE_ANON_KEY}</li>
        <li>Supabase URL: {env.VITE_PUBLIC_SUPABASE_URL}</li>
      </ul>
    </main>
  )
}
