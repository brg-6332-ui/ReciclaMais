import { A } from '@solidjs/router'
import { BarChart3, MapPin } from 'lucide-solid'

import { useInView } from '~/features/guide/hooks/useInView'

/**
 * Final CTA section — invites the user to use the map or dashboard.
 */
export function GuideCTA() {
  const { inView, setRef } = useInView({ threshold: 0.15 })

  return (
    <section
      ref={setRef}
      class="py-24 bg-linear-to-br from-primary-50/60 via-base-100 to-accent-100/40 transition-opacity duration-600"
      classList={{
        'opacity-0': !inView(),
        'opacity-100': inView(),
      }}
    >
      <div class="container mx-auto px-6">
        <div class="max-w-2xl mx-auto text-center space-y-8">
          <div class="space-y-4">
            <h2 class="text-3xl md:text-4xl font-bold text-base-content">
              Pronto para reciclar melhor?
            </h2>
            <p class="text-lg text-text-500">
              Agora que já sabes como separar, encontra o ponto de recolha mais
              próximo e faz a diferença.
            </p>
          </div>

          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <A
              href="/collection-points"
              class="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-primary-500 text-primary-content font-semibold hover:bg-primary-600 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
            >
              <MapPin class="w-5 h-5" />
              Abrir Mapa
            </A>
            <A
              href="/dashboard"
              class="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl border-2 border-primary-300/60 text-primary-700 font-semibold hover:bg-primary-50 hover:scale-[1.02] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
            >
              <BarChart3 class="w-5 h-5" />
              Ver Dashboard
            </A>
          </div>
        </div>
      </div>
    </section>
  )
}
