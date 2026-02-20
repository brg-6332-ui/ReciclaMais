import { createSignal } from 'solid-js'

import { GUIDE_CATEGORIES } from '~/features/guide/data/guideData'
import { CategoryDetail } from '~/features/guide/sections/CategoryDetail'
import { CategoryGrid } from '~/features/guide/sections/CategoryGrid'
import { GuideCTA } from '~/features/guide/sections/GuideCTA'
import { GuideHero } from '~/features/guide/sections/GuideHero'
import { ImpactSection } from '~/features/guide/sections/ImpactSection'
import { MiniQuiz } from '~/features/guide/sections/MiniQuiz'

export function GuidePage() {
  const [selectedCategory, setSelectedCategory] = createSignal(
    GUIDE_CATEGORIES[0].id,
  )

  const handleSelectCategory = (id: string) => {
    setSelectedCategory(id)
    setTimeout(() => {
      document
        .getElementById('guide-detail')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  return (
    <main class="min-h-screen">
      <GuideHero />
      <CategoryGrid
        selectedId={selectedCategory}
        onSelect={handleSelectCategory}
      />
      <CategoryDetail selectedId={selectedCategory} />
      <MiniQuiz />
      <ImpactSection />
      <GuideCTA />
    </main>
  )
}
