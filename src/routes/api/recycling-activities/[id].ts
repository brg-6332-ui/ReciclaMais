import type { APIEvent } from '@solidjs/start/server'

import { deleteRecyclingActivityController } from '~/modules/recycling-activity/interface/http/recycling-activity.controller'

export async function DELETE(event: APIEvent) {
  return await deleteRecyclingActivityController(event, event.params?.id)
}
