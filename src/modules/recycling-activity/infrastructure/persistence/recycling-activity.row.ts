export type RecyclingActivityRow = {
  id: number
  user_id: string
  material: string
  grams: number
  date: string
  location_id: string | null
  reward: string | null
}

export type InsertRecyclingActivityRow = {
  user_id: string
  material: string
  grams: number
  date: string
  location_id: string | null
  reward: string
}
