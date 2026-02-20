import { A } from '@solidjs/router'
import { BookOpen, MapPin } from 'lucide-solid'
import { Motion } from 'solid-motionone'

import { usePrefersReducedMotion } from '~/modules/guide/hooks/usePrefersReducedMotion'

/**
 * Organic floating shapes for the hero background.
 * Uses slow CSS keyframe animations for a premium feel.
 * Respects prefers-reduced-motion.
 */
function HeroShapes() {
  const prefersReduced = usePrefersReducedMotion()

  return (
    <div
      class="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Large organic blob top-right */}
      <div
        class="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-30"
        classList={{
          'animate-[float_12s_ease-in-out_infinite]': !prefersReduced(),
        }}
        style={{
          background:
            'radial-gradient(circle, var(--color-primary-200) 0%, transparent 70%)',
        }}
      />
      {/* Medium blob left */}
      <div
        class="absolute top-1/3 -left-16 w-72 h-72 rounded-full opacity-20"
        classList={{
          'animate-[float_10s_ease-in-out_infinite_reverse]': !prefersReduced(),
        }}
        style={{
          background:
            'radial-gradient(circle, var(--color-accent-300) 0%, transparent 70%)',
        }}
      />
      {/* Small accent blob bottom */}
      <div
        class="absolute bottom-10 right-1/4 w-48 h-48 rounded-full opacity-25"
        classList={{
          'animate-[float_8s_ease-in-out_infinite]': !prefersReduced(),
        }}
        style={{
          background:
            'radial-gradient(circle, var(--color-secondary-300) 0%, transparent 70%)',
        }}
      />
    </div>
  )
}

/**
 * Animated scroll-down indicator arrow
 */
function ScrollIndicator() {
  return (
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
      <svg
        class="w-6 h-6 text-base-content/40"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M19 14l-7 7m0 0l-7-7m7 7V3"
        />
      </svg>
    </div>
  )
}

/**
 * Hero section — "Guia Inteligente de Reciclagem"
 * Full-viewport hero with animated background, headline, and CTAs.
 */
export function GuideHero() {
  return (
    <section class="relative min-h-[85vh] flex items-center overflow-hidden bg-linear-to-br from-base-100 via-primary-50/80 to-accent-100/60">
      <HeroShapes />
      <div class="container mx-auto px-6 py-20 relative z-10">
        <div class="max-w-3xl mx-auto text-center space-y-8">
          {/* Headline */}
          <Motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-6">
              <BookOpen class="w-4 h-4" />
              Guia Educativo
            </span>
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-base-content">
              Guia Inteligente{' '}
              <span class="text-primary-600">de Reciclagem</span>
            </h1>
          </Motion.div>

          {/* Subheadline */}
          <Motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            class="text-lg md:text-xl text-text-500 max-w-xl mx-auto"
          >
            Aprende a separar corretamente e encontra o destino certo para cada
            resíduo. Simples, claro e interativo.
          </Motion.p>

          {/* CTAs */}
          <Motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            class="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={() => {
                document
                  .getElementById('guide-categories')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }}
              class="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-primary-500 text-primary-content font-semibold hover:bg-primary-600 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
            >
              <BookOpen class="w-5 h-5" />
              Explorar Guia
            </button>
            <A
              href="/collection-points"
              class="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl border-2 border-primary-300/60 text-primary-700 font-semibold hover:bg-primary-50 hover:scale-[1.02] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
            >
              <MapPin class="w-5 h-5" />
              Ver Pontos no Mapa
            </A>
          </Motion.div>
        </div>
      </div>
      <ScrollIndicator />
    </section>
  )
}
