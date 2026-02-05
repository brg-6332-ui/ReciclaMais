import { env } from '~/utils/env'

export default function TestEnv() {
  return (
    <main class="">
      <h1>Variáveis de Ambiente</h1>
      <ul>
        <li>Chave da API Google Maps: {env.VITE_GOOGLE_MAPS_API_KEY}</li>
        <li>ID do mapa Google Maps: {env.VITE_GOOGLE_MAPS_MAP_ID}</li>
        <li>Chave pública do Supabase: {env.VITE_PUBLIC_SUPABASE_ANON_KEY}</li>
        <li>URL do Supabase: {env.VITE_PUBLIC_SUPABASE_URL}</li>
      </ul>
    </main>
  )
}
