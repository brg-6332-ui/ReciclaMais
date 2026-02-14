import { createSignal } from 'solid-js'

import { GUIDE_CATEGORIES } from '~/modules/guide/data/guideData'
import { CategoryDetail } from '~/modules/guide/sections/CategoryDetail'
import { CategoryGrid } from '~/modules/guide/sections/CategoryGrid'
import { GuideCTA } from '~/modules/guide/sections/GuideCTA'
import { GuideHero } from '~/modules/guide/sections/GuideHero'
import { ImpactSection } from '~/modules/guide/sections/ImpactSection'
import { MiniQuiz } from '~/modules/guide/sections/MiniQuiz'

/**
 * /guide route — interactive recycling guide page.
 * Composed of: Hero, CategoryGrid, CategoryDetail, MiniQuiz, ImpactSection, CTA.
 */
export default function GuidePage() {
  const [selectedCategory, setSelectedCategory] = createSignal(
    GUIDE_CATEGORIES[0].id,
  )

  const handleSelectCategory = (id: string) => {
    setSelectedCategory(id)
    // Smooth-scroll to the detail section after a short delay
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
