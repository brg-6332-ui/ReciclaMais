import { z } from 'zod'

export const POIPropertiesSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  slug: z.string().optional(),
  type: z.string().optional(),
  families_pope: z.any().optional(),
  location_types_pope: z.any().optional(),
  plainWastes: z.any().optional(),
  plainTypes: z.any().optional(),
  plainFilters: z.any().optional(),
  name: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  schedule: z.string().optional(),
  rating: z.number().optional(),
  company: z.string().optional(),
  wasteTypes: z.array(z.string()).optional(),
})

export const FeatureSchema = z.object({
  type: z.literal('Feature'),
  id: z.union([z.string(), z.number()]).optional(),
  properties: POIPropertiesSchema,
  geometry: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number(), z.number()]),
  }),
})

export const FeatureCollectionSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(FeatureSchema),
})

export type POIProperties = z.infer<typeof POIPropertiesSchema>
export type POIFeature = z.infer<typeof FeatureSchema>
export type POIFeatureCollection = z.infer<typeof FeatureCollectionSchema>
