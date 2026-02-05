import z from 'zod/v4'

/**
 * Valid material types for recycling activities.
 */
export const MATERIAL_TYPES = ['plastic', 'glass', 'paper', 'metal'] as const
export type MaterialType = (typeof MATERIAL_TYPES)[number]

/**
 * Reward rates per gram for each material type.
 */
export const REWARD_RATES: Record<MaterialType, number> = {
  plastic: 0.0004, // 0.40€ per kg
  glass: 0.000375, // 0.375€ per kg
  paper: 0.0004, // 0.40€ per kg
  metal: 0.0005, // 0.50€ per kg
}

/**
 * CO2 saved per gram for each material type (in grams of CO2).
 */
export const CO2_RATES: Record<MaterialType, number> = {
  plastic: 0.002, // 2kg CO2 per kg plastic
  glass: 0.0003, // 0.3kg CO2 per kg glass
  paper: 0.0009, // 0.9kg CO2 per kg paper
  metal: 0.0015, // 1.5kg CO2 per kg metal
}

/**
 * Schema for activity stored in database.
 */
export const activitySchema = z.object({
  id: z.number(),
  user_id: z.uuid(),
  material: z.string(),
  grams: z.number(),
  location_id: z.string(),
  date: z.string(),
  reward: z.string().nullable(),
  __type: z
    .string()
    .nullish()
    .transform(() => 'Activity' as const),
})

export type Activity = z.infer<typeof activitySchema>
export type NewActivity = Omit<Activity, 'id'>

/**
 * Payload for creating a new activity (client-side).
 */
export interface CreateActivityPayload {
  material: MaterialType
  grams: number
  occurred_at: string
  collection_point_id?: string
}

/**
 * Response from API after creating an activity.
 */
export interface ActivityResponse {
  activity: {
    id: number
    material: string
    grams: number
    reward: number
    occurred_at: string
    collection_point_name?: string
  }
}

/**
 * Calculates the reward for a given material and weight.
 * @param material - The material type
 * @param grams - Weight in grams
 * @returns Reward in euros (2 decimal places)
 */
export function calculateReward(material: MaterialType, grams: number): number {
  const rate = REWARD_RATES[material]
  return Math.round(grams * rate * 100) / 100
}

/**
 * Creates a new activity object from input data.
 * @param data - Activity data without id and __type
 * @returns Parsed activity object
 */
export function createNewActivity(
  data: Omit<NewActivity, '__type'>,
): NewActivity {
  return activitySchema.omit({ id: true }).parse(data)
}
