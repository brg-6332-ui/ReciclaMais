import { CreateRecyclingActivityUseCase } from '../../application/usecases/create-recycling-activity.usecase'
import { DeleteRecyclingActivityUseCase } from '../../application/usecases/delete-recycling-activity.usecase'
import { GetDashboardSummaryUseCase } from '../../application/usecases/get-dashboard-summary.usecase'
import { ListRecyclingActivitiesUseCase } from '../../application/usecases/list-recycling-activities.usecase'
import { createSupabaseRecyclingActivityRepository } from '../persistence/supabase-recycling-activity.repository'

export function createRecyclingActivityBootstrap(request: Request) {
  const repository = createSupabaseRecyclingActivityRepository(request)

  return {
    createRecyclingActivityUseCase: new CreateRecyclingActivityUseCase(
      repository,
    ),
    listRecyclingActivitiesUseCase: new ListRecyclingActivitiesUseCase(
      repository,
    ),
    deleteRecyclingActivityUseCase: new DeleteRecyclingActivityUseCase(
      repository,
    ),
    getDashboardSummaryUseCase: new GetDashboardSummaryUseCase(repository),
  }
}
