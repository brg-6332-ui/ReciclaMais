import { createEffect, createRoot } from 'solid-js'

import { createActivityStore } from '~/modules/activity/application/store/activityStore'
import { createSupabaseActivityRepository } from '~/modules/activity/infrastructure/supabase/supabaseActivityRepository'
import { useAuthState } from '~/modules/auth/application/authState'

const res = createRoot(() => {
  const store = createActivityStore()
  const repository = createSupabaseActivityRepository()

  const { authState } = useAuthState()

  createEffect(() => {
    const user = authState().session?.user.id

    if (user === undefined) {
      store.setActivities([])
      return
    }

    repository
      .fetchActivities(user)
      .then((activities) => {
        store.setActivities(activities || [])
      })
      .catch((error) => {
        console.error('Failed to fetch activities in effect:', error)
      })
  })

  return {
    activities: store.activities,
    repository,
  }
})

export const activityUseCases = {
  // Placeholder for future activity-related use cases
  pocAddActivity: () => {
    console.log(
      'Adicionar atividade de reciclagem - funcionalidade em desenvolvimento',
    )
  },

  activities: res.activities,
}
