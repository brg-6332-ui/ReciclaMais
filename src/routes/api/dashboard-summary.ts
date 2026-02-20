import type { APIEvent } from '@solidjs/start/server'

import { getDashboardSummaryController } from '~/modules/recycling-activity/interface/http/recycling-activity.controller'

export async function GET(event: APIEvent) {
  return await getDashboardSummaryController(event)
}
