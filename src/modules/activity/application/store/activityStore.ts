import { createSignal } from 'solid-js'

import { Activity } from '~/modules/activity/domain/activity'

export function createActivityStore() {
  const [activities, setActivities] = createSignal([] as readonly Activity[])

  return {
    activities,
    setActivities,
  }
}
