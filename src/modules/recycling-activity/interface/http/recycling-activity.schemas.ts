import { z } from 'zod/v4'

import { MATERIAL_TYPES } from '../../domain/material-type.vo'

export const createRecyclingActivityRequestDTOSchema = z.object({
  material: z.enum(MATERIAL_TYPES),
  grams: z.number().int().positive().max(50_000_000),
  occurred_at: z.iso.datetime(),
  collection_point_id: z.string().optional(),
})

export type CreateRecyclingActivityRequestDTO = z.infer<
  typeof createRecyclingActivityRequestDTOSchema
>
