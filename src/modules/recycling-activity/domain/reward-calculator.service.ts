import type { MaterialType } from './material-type.vo'

const REWARD_RATES: Record<MaterialType, number> = {
  plastic: 0.0004,
  glass: 0.000375,
  paper: 0.0004,
  metal: 0.0005,
}

export function calculateRecyclingReward(
  material: MaterialType,
  grams: number,
): number {
  const rate = REWARD_RATES[material]
  return Math.round(grams * rate * 100) / 100
}
