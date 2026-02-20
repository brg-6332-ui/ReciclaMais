import { A } from '@solidjs/router'
import {
  Building2,
  Gift,
  Leaf,
  MapPin,
  Recycle,
  TrendingUp,
  Users,
} from 'lucide-solid'
import { For } from 'solid-js'
import { Motion } from 'solid-motionone'

import heroImage from '~/assets/hero-recycling.jpg'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { useInView } from '~/modules/guide/hooks/useInView'
import { usePrefersReducedMotion } from '~/modules/guide/hooks/usePrefersReducedMotion'

/**
 * Floating organic background shapes for the hero section.
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
      {/* Large organic blob — top-left */}
      <div
        class="absolute -top-24 -left-16 w-96 h-96 rounded-full opacity-[0.15]"
        classList={{
          'animate-[float_14s_ease-in-out_infinite]': !prefersReduced(),
        }}
        style={{
          background:
            'radial-gradient(circle, var(--color-primary-200) 0%, transparent 70%)',
        }}
      />
      {/* Medium organic blob — bottom-right */}
      <div
        class="absolute bottom-0 -right-16 w-72 h-72 rounded-full opacity-[0.12]"
        classList={{
          'animate-[float_10s_ease-in-out_infinite_reverse]': !prefersReduced(),
        }}
        style={{
          background:
            'radial-gradient(circle, var(--color-accent-300) 0%, transparent 70%)',
        }}
      />
    </div>
  )
}

const Home = () => {
  const stats = [
    {
      icon: Recycle,
      value: '250+',
      label: 'Toneladas Recicladas',
      color: 'text-primary-500',
    },
    {
      icon: Users,
      value: '10.5K',
      label: 'Utilizadores Ativos',
      color: 'text-accent-500',
    },
    {
      icon: Building2,
      value: '150+',
      label: 'Empresas Parceiras',
      color: 'text-primary-500',
    },
    {
      icon: TrendingUp,
      value: '92%',
      label: 'Taxa de Reciclagem',
      color: 'text-accent-500',
    },
  ]

  const features = [
    {
      icon: MapPin,
      title: 'Pontos de Recolha',
      description:
        'Encontre facilmente os pontos de recolha mais próximos no mapa interativo',
    },
    {
      icon: Gift,
      title: 'Recompensas',
      description:
        'Ganhe recompensas por cada material reciclado e contribua para o ambiente',
    },
    {
      icon: Leaf,
      title: 'Impacto Ambiental',
      description: 'Acompanhe o seu impacto positivo no planeta em tempo real',
    },
  ]

  const { inView: statsInView, setRef: setStatsRef } = useInView({
    threshold: 0.1,
  })
  const { inView: featuresInView, setRef: setFeaturesRef } = useInView({
    threshold: 0.1,
  })
  const { inView: ctaInView, setRef: setCtaRef } = useInView({
    threshold: 0.15,
  })
  const prefersReduced = usePrefersReducedMotion()

  return (
    <div class="min-h-screen bg-base-100">
      {/* Hero Section */}
      <section class="relative overflow-hidden">
        <div class="absolute inset-0 bg-base-200" />
        <HeroShapes />
        <div class="container mx-auto px-4 py-8 sm:py-20 relative">
          <div class="grid lg:grid-cols-2 gap-12 items-center">
            <div class="space-y-8 order-2 lg:order-1">
              {/* Title — fade + slide-up, matches /guide hero pattern */}
              <Motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
                  Recicle e receba{' '}
                  <span class="bg-linear-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                    recompensas!
                  </span>
                </h1>
              </Motion.div>
              {/* Subtitle — slightly delayed */}
              <Motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                class="text-base sm:text-xl text-muted-foreground"
              >
                Transforme os seus resíduos em valor. Junte-se à nossa
                comunidade e contribua para um planeta mais sustentável enquanto
                ganha benefícios.
              </Motion.p>
              {/* CTAs — enter last */}
              <Motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                class="flex flex-wrap gap-4"
              >
                <A href="/dashboard">
                  <Button
                    variant="hero"
                    size="lg"
                    class="shadow-lg w-full sm:w-auto hover:scale-[1.02] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
                  >
                    Começar Agora
                  </Button>
                </A>
                <A href="/collection-points">
                  <Button
                    variant="outline"
                    size="lg"
                    class="w-full sm:w-auto hover:scale-[1.02] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
                  >
                    Ver Pontos de Recolha
                  </Button>
                </A>
              </Motion.div>
            </div>
            {/* Hero image — scale-in with delay */}
            <Motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              class="relative order-1 lg:order-2"
            >
              <div class="absolute inset-0 bg-linear-to-br from-primary-500/20 to-accent-500/20 rounded-3xl blur-3xl" />
              <img
                src={heroImage}
                alt="Pessoas a reciclar felizes"
                class="relative rounded-3xl shadow-2xl w-full h-40 sm:h-64 md:h-auto object-cover"
              />
            </Motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section — staggered reveal on scroll */}
      <section ref={setStatsRef} class="py-16 bg-base-100">
        <div class="container mx-auto px-4">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <For each={stats}>
              {(stat, index) => {
                const Icon = stat.icon
                return (
                  <div
                    class="transition-all duration-500 ease-out"
                    classList={{
                      'opacity-0 translate-y-6': !statsInView(),
                      'opacity-100 translate-y-0': statsInView(),
                    }}
                    style={{
                      'transition-delay': prefersReduced()
                        ? '0ms'
                        : `${index() * 80}ms`,
                    }}
                  >
                    <Card class="border-none bg-base-50 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ease-out">
                      <CardContent class="p-6 text-center space-y-2">
                        <Icon class={`h-10 w-10 mx-auto ${stat.color}`} />
                        <div class="text-3xl font-bold">{stat.value}</div>
                        <div class="text-sm text-muted-foreground">
                          {stat.label}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )
              }}
            </For>
          </div>
        </div>
      </section>

      {/* Features Section — heading fade + card stagger */}
      <section ref={setFeaturesRef} class="py-20">
        <div class="container mx-auto px-4">
          <div
            class="text-center mb-16 transition-all duration-500 ease-out"
            classList={{
              'opacity-0 translate-y-4': !featuresInView(),
              'opacity-100 translate-y-0': featuresInView(),
            }}
          >
            <h2 class="text-4xl font-bold mb-4">Como Funciona</h2>
            <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
              Um processo simples e eficaz para tornar a reciclagem
              recompensadora
            </p>
          </div>
          <div class="grid md:grid-cols-3 gap-8">
            <For each={features}>
              {(feature, index) => {
                const Icon = feature.icon
                return (
                  <div
                    class="transition-all duration-500 ease-out"
                    classList={{
                      'opacity-0 translate-y-6': !featuresInView(),
                      'opacity-100 translate-y-0': featuresInView(),
                    }}
                    style={{
                      'transition-delay': prefersReduced()
                        ? '0ms'
                        : `${100 + index() * 100}ms`,
                    }}
                  >
                    <Card class="border-none bg-base-50 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out h-full">
                      <CardContent class="p-8 space-y-4">
                        <div class="h-16 w-16 rounded-2xl bg-linear-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
                          <Icon class="h-8 w-8 text-primary-950" />
                        </div>
                        <h3 class="text-2xl font-bold">{feature.title}</h3>
                        <p class="text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )
              }}
            </For>
          </div>
        </div>
      </section>

      {/* CTA Section — fade-up reveal on scroll */}
      <section class="py-20 relative overflow-hidden">
        <div class="absolute inset-0 bg-base-100" />
        <div class="container mx-auto px-4 relative">
          <div
            ref={setCtaRef}
            class="transition-all duration-500 ease-out"
            classList={{
              'opacity-0 translate-y-6': !ctaInView(),
              'opacity-100 translate-y-0': ctaInView(),
            }}
          >
            <Card class="border-none shadow-xl bg-base-50">
              <CardContent class="p-12 text-center space-y-6">
                <h2 class="text-4xl font-bold">Pronto para Começar?</h2>
                <p class="text-xl opacity-90 max-w-2xl mx-auto">
                  Junte-se a milhares de utilizadores que já estão a fazer a
                  diferença. Comece hoje a reciclar e a ganhar recompensas!
                </p>
                <A href="/auth">
                  <Button
                    size="lg"
                    class="shadow-xl text-white hover:scale-[1.02] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
                  >
                    Criar Conta Gratuita
                  </Button>
                </A>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
