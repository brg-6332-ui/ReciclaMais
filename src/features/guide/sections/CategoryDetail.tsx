import { AlertTriangle, CheckCircle2, Lightbulb, XCircle } from 'lucide-solid'
import { type Accessor, createSignal, For, Show } from 'solid-js'

import {
  BIN_COLOR_STYLES,
  GUIDE_CATEGORIES,
  type GuideCategory,
} from '~/features/guide/data/guideData'
import { useInView } from '~/features/guide/hooks/useInView'
import { usePrefersReducedMotion } from '~/features/guide/hooks/usePrefersReducedMotion'

type DetailTab = 'can' | 'cannot' | 'tips' | 'mistakes'

const TABS: { id: DetailTab; label: string; icon: typeof CheckCircle2 }[] = [
  { id: 'can', label: 'Pode', icon: CheckCircle2 },
  { id: 'cannot', label: 'Não Pode', icon: XCircle },
  { id: 'tips', label: 'Dicas', icon: Lightbulb },
  { id: 'mistakes', label: 'Erros', icon: AlertTriangle },
]

/**
 * Staggered list items with enter animation
 */
function StaggerList(props: {
  items: string[]
  icon: 'check' | 'x' | 'tip' | 'warn'
}) {
  const prefersReduced = usePrefersReducedMotion()

  const iconClass = () => {
    switch (props.icon) {
      case 'check':
        return 'text-success'
      case 'x':
        return 'text-error'
      case 'tip':
        return 'text-info'
      case 'warn':
        return 'text-warning'
    }
  }

  const iconSymbol = () => {
    switch (props.icon) {
      case 'check':
        return '✓'
      case 'x':
        return '✗'
      case 'tip':
        return '💡'
      case 'warn':
        return '⚠'
    }
  }

  return (
    <ul class="space-y-3">
      <For each={props.items}>
        {(item, index) => (
          <li
            class="flex items-start gap-3 text-base-content/85 transition-all duration-300 ease-out"
            classList={{
              'opacity-100 translate-x-0': true,
            }}
            style={{
              'transition-delay': prefersReduced()
                ? '0ms'
                : `${index() * 50}ms`,
              animation: prefersReduced()
                ? 'none'
                : `slideInLeft 0.3s ease-out ${index() * 50}ms both`,
            }}
          >
            <span class={`shrink-0 mt-0.5 text-sm font-bold ${iconClass()}`}>
              {iconSymbol()}
            </span>
            <span class="text-sm leading-relaxed">{item}</span>
          </li>
        )}
      </For>
    </ul>
  )
}

/**
 * Category detail section — shows the content for the selected category
 * with a tab interface: "Pode / Não Pode / Dicas / Erros Comuns".
 */
export function CategoryDetail(props: { selectedId: Accessor<string> }) {
  const [activeTab, setActiveTab] = createSignal<DetailTab>('can')
  const { inView, setRef } = useInView({ threshold: 0.05 })

  const category = (): GuideCategory | undefined =>
    GUIDE_CATEGORIES.find((c) => c.id === props.selectedId())

  const styles = () => {
    const cat = category()
    if (!cat) return BIN_COLOR_STYLES.blue
    return BIN_COLOR_STYLES[cat.binColor]
  }

  const tabContent = () => {
    const cat = category()
    if (!cat) return []
    switch (activeTab()) {
      case 'can':
        return cat.canRecycle
      case 'cannot':
        return cat.cannotRecycle
      case 'tips':
        return cat.tips
      case 'mistakes':
        return cat.commonMistakes
    }
  }

  const tabIcon = (): 'check' | 'x' | 'tip' | 'warn' => {
    switch (activeTab()) {
      case 'can':
        return 'check'
      case 'cannot':
        return 'x'
      case 'tips':
        return 'tip'
      case 'mistakes':
        return 'warn'
    }
  }

  return (
    <section
      id="guide-detail"
      ref={setRef}
      class="py-20 bg-base-100 transition-opacity duration-500"
      classList={{
        'opacity-0': !inView(),
        'opacity-100': inView(),
      }}
    >
      <div class="container mx-auto px-6">
        <Show
          when={category()}
          fallback={
            <div class="text-center py-16">
              <p class="text-text-500 text-lg">
                Seleciona uma categoria acima para ver os detalhes.
              </p>
            </div>
          }
        >
          {(cat) => (
            <div class="max-w-5xl mx-auto">
              <div class="grid lg:grid-cols-5 gap-10 items-start">
                {/* Left: Visual / Icon block */}
                <div class="lg:col-span-2 flex flex-col items-center lg:items-start gap-6">
                  <div
                    class="w-28 h-28 rounded-3xl flex items-center justify-center shadow-lg"
                    classList={{ [styles().bg]: true }}
                  >
                    {cat().icon({
                      class: 'w-14 h-14 text-white',
                    })}
                  </div>
                  <div class="text-center lg:text-left">
                    <h3 class="text-2xl md:text-3xl font-bold text-base-content mb-2">
                      {cat().title}
                    </h3>
                    <span
                      class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                      classList={{ [styles().chip]: true }}
                    >
                      <span
                        class="w-2.5 h-2.5 rounded-full"
                        classList={{ [styles().bg]: true }}
                      />
                      {cat().binLabel}
                    </span>
                  </div>

                  {/* Impact facts */}
                  <div class="space-y-3 mt-4 w-full">
                    <For each={cat().impactFacts}>
                      {(fact) => (
                        <div class="flex items-start gap-2 p-3 rounded-xl bg-base-200/60 border border-base-300/40">
                          <span class="shrink-0 text-primary-500 mt-0.5">
                            🌱
                          </span>
                          <p class="text-xs text-text-500 leading-relaxed">
                            {fact}
                          </p>
                        </div>
                      )}
                    </For>
                  </div>
                </div>

                {/* Right: Tabs + Content */}
                <div class="lg:col-span-3">
                  {/* Tab bar */}
                  <div class="flex gap-1 p-1 rounded-xl bg-base-200/80 mb-6">
                    <For each={TABS}>
                      {(tab) => (
                        <button
                          onClick={() => setActiveTab(tab.id)}
                          aria-pressed={activeTab() === tab.id}
                          class="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                          classList={{
                            'bg-base-50 text-base-content shadow-sm':
                              activeTab() === tab.id,
                            'text-text-500 hover:text-base-content hover:bg-base-100/60':
                              activeTab() !== tab.id,
                          }}
                        >
                          <tab.icon class="w-4 h-4" />
                          <span class="hidden sm:inline">{tab.label}</span>
                        </button>
                      )}
                    </For>
                  </div>

                  {/* Tab content */}
                  <div class="min-h-[200px] p-6 rounded-2xl bg-base-50 border border-base-300/40 shadow-sm">
                    <StaggerList items={tabContent()} icon={tabIcon()} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </Show>
      </div>
    </section>
  )
}
