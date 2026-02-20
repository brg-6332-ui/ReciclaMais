import { z } from 'zod'

export const CollectionPointResponseDTOSchema = z.object({
  id: z.string(),
  slug: z.string().nullable(),
  type: z.string(),
  kind: z.enum(['collection-point', 'gps']),
  latitude: z.number(),
  longitude: z.number(),
  name: z.string(),
  address: z.string().nullable(),
  phone: z.string().nullable(),
  schedule: z.string().nullable(),
  rating: z.number().nullable(),
  company: z.string().nullable(),
  wasteTypes: z.array(z.string()),
  familiesPope: z.array(z.object({ slug: z.string() })),
  locationTypesPope: z.array(z.object({ slug: z.string() })),
  plainTypes: z.string(),
  plainFilters: z.string(),
})

export const CollectionPointsResponseDTOSchema = z.object({
  points: z.array(CollectionPointResponseDTOSchema),
})
