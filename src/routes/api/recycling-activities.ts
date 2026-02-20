import type { APIEvent } from '@solidjs/start/server'

import {
  getRecyclingActivitiesController,
  postRecyclingActivityController,
} from '~/modules/recycling-activity/interface/http/recycling-activity.controller'

export async function GET(event: APIEvent) {
  return await getRecyclingActivitiesController(event)
}

export async function POST(event: APIEvent) {
  return await postRecyclingActivityController(event)
}
