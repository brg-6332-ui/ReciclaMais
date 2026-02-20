import { type Accessor, For } from 'solid-js'

import {
  BIN_COLOR_STYLES,
  GUIDE_CATEGORIES,
  type GuideCategory,
} from '~/features/guide/data/guideData'
import { useInView } from '~/features/guide/hooks/useInView'
import { usePrefersReducedMotion } from '~/features/guide/hooks/usePrefersReducedMotion'

/**
 * A single category card with icon, title, bin color chip, and hover micro-interaction.
 */
function CategoryCard(props: {
  category: GuideCategory
  isSelected: boolean
  index: number
  onSelect: () => void
}) {
  const { inView, setRef } = useInView({ threshold: 0.1 })
  const prefersReduced = usePrefersReducedMotion()
  const styles = () => BIN_COLOR_STYLES[props.category.binColor]

  return (
    <button
      ref={setRef}
      onClick={() => props.onSelect()}
      aria-label={`Selecionar categoria: ${props.category.title}`}
      aria-pressed={props.isSelected}
      class="group relative w-full text-left rounded-2xl p-5 border-2 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
      classList={{
        'border-primary-400 bg-primary-100 shadow-md scale-[1.02]':
          props.isSelected,
        'border-base-300/60 bg-base-100 hover:border-base-400/80 hover:shadow-sm hover:scale-[1.01]':
          !props.isSelected,
        'opacity-0 translate-y-4': !inView(),
        'opacity-100 translate-y-0': inView(),
      }}
      style={{
        'transition-delay': prefersReduced() ? '0ms' : `${props.index * 60}ms`,
      }}
    >
      {/* Icon + Title */}
      <div class="flex items-center gap-3 mb-3">
        <div
          class="w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
          classList={{
            [styles().bg]: true,
          }}
        >
          <props.category.icon class="w-5 h-5 text-white" />
        </div>
        <h3 class="font-semibold text-base-content text-base">
          {props.category.title}
        </h3>
      </div>

      {/* Bin color chip */}
      <span
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
        classList={{ [styles().chip]: true }}
      >
        <span
          class="w-2 h-2 rounded-full"
          classList={{ [styles().bg]: true }}
        />
        {props.category.binLabel}
      </span>

      {/* Selection indicator */}
      {props.isSelected && (
        <div class="absolute top-3 right-3">
          <svg
            class="w-5 h-5 text-primary-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      )}
    </button>
  )
}

/**
 * Interactive grid of category cards with selection state.
 * Responsive: 2 cols on mobile, 3 on tablet, 3-4 on desktop.
 */
export function CategoryGrid(props: {
  selectedId: Accessor<string>
  onSelect: (id: string) => void
}) {
  return (
    <section id="guide-categories" class="py-20 bg-base-200">
      <div class="container mx-auto px-6">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-base-content mb-4">
            Categorias de Resíduos
          </h2>
          <p class="text-text-500 max-w-xl mx-auto">
            Seleciona uma categoria para aprender como separar corretamente.
          </p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <For each={GUIDE_CATEGORIES}>
            {(category, index) => (
              <CategoryCard
                category={category}
                isSelected={props.selectedId() === category.id}
                index={index()}
                onSelect={() => props.onSelect(category.id)}
              />
            )}
          </For>
        </div>
      </div>
    </section>
  )
}
