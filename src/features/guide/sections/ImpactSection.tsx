import { Leaf, Recycle, Sparkles, TrendingUp } from 'lucide-solid'
import { For } from 'solid-js'

import { useInView } from '~/features/guide/hooks/useInView'
import { usePrefersReducedMotion } from '~/features/guide/hooks/usePrefersReducedMotion'

const IMPACT_CARDS = [
  {
    icon: Recycle,
    title: 'Reduz contaminação',
    description:
      'Separar corretamente evita que materiais recicláveis fiquem contaminados e sejam rejeitados.',
    accent: 'bg-primary-100 text-primary-600',
  },
  {
    icon: Leaf,
    title: 'Poupa recursos naturais',
    description:
      'Reciclar reduz a necessidade de extrair matérias-primas, preservando florestas, minerais e água.',
    accent: 'bg-success/15 text-success',
  },
  {
    icon: TrendingUp,
    title: 'Menos energia, menos CO₂',
    description:
      'A produção a partir de materiais reciclados consome menos energia do que a partir de matérias-primas.',
    accent: 'bg-info/15 text-info',
  },
  {
    icon: Sparkles,
    title: 'Pequenas ações somam',
    description:
      'Cada embalagem bem separada conta. A reciclagem começa em casa, com gestos simples do dia-a-dia.',
    accent: 'bg-accent-100 text-accent-700',
  },
]

/**
 * Impact / motivation section with animated cards.
 * Shows environmental benefits of recycling in an emotionally engaging way.
 */
export function ImpactSection() {
  const { inView, setRef } = useInView({ threshold: 0.1 })
  const prefersReduced = usePrefersReducedMotion()

  return (
    <section
      ref={setRef}
      class="py-20 bg-base-100 transition-opacity duration-500"
      classList={{
        'opacity-0': !inView(),
        'opacity-100': inView(),
      }}
    >
      <div class="container mx-auto px-6">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-base-content mb-3">
            O teu impacto importa
          </h2>
          <p class="text-text-500 max-w-xl mx-auto">
            Cada gesto de reciclagem contribui para um ambiente mais saudável e
            um futuro mais sustentável.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <For each={IMPACT_CARDS}>
            {(card, index) => (
              <div
                class="group rounded-2xl p-6 bg-base-50 border border-base-300/40 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 ease-out text-center"
                classList={{
                  'opacity-0 translate-y-6': !inView(),
                  'opacity-100 translate-y-0': inView(),
                }}
                style={{
                  'transition-delay': prefersReduced()
                    ? '0ms'
                    : `${index() * 80}ms`,
                }}
              >
                <div
                  class={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-110 ${card.accent}`}
                >
                  <card.icon class="w-7 h-7" />
                </div>
                <h3 class="font-semibold text-base-content mb-2">
                  {card.title}
                </h3>
                <p class="text-sm text-text-500 leading-relaxed">
                  {card.description}
                </p>
              </div>
            )}
          </For>
        </div>
      </div>
    </section>
  )
}
