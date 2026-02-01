import z from 'zod/v4'

export const activitySchema = z.object({
  id: z.number(),
  user_id: z.uuid(),
  material: z.string(),
  grams: z.number(),
  location_id: z.string(),
  date: z.string(),
  reward: z.string(),
  __type: z
    .string()
    .nullish()
    .transform(() => 'Activity' as const),
})

export type Activity = z.infer<typeof activitySchema>
export type NewActivity = Omit<Activity, 'id'>

export function createNewActivity(
  data: Omit<NewActivity, '__type'>,
): NewActivity {
  return activitySchema.omit({ id: true }).parse(data)
}
