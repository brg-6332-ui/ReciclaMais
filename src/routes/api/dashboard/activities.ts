import type { APIEvent } from '@solidjs/start/server'

import { postRecyclingActivityController } from '~/modules/recycling-activity/interface/http/recycling-activity.controller'

export async function POST(event: APIEvent): Promise<Response> {
  return await postRecyclingActivityController(event)
}
