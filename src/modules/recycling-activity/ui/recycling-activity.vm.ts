export type RecyclingMaterialVM = 'plastic' | 'glass' | 'paper' | 'metal'

export type RecyclingActivityVM = {
  id: number
  date: string
  type: RecyclingMaterialVM
  amount: number
  reward: number
  location?: string
}
