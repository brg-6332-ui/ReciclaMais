export type RecyclingActivityResponseDTO = {
  id: number
  material: string
  grams: number
  reward: number
  occurred_at: string
  collection_point_name?: string
}

export type CreateRecyclingActivityResponseDTO = {
  activity: RecyclingActivityResponseDTO
}

export type ListRecyclingActivitiesResponseDTO = {
  activities: RecyclingActivityResponseDTO[]
}
