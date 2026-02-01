import type { Feature, FeatureCollection, Point } from 'geojson'

import {
  FeatureCollectionSchema,
  POIProperties,
} from '~/modules/collection-points/schemas'
import * as POI from '~/poi.json'
import { getActiveEntries } from '~/routes/api/test-gps/store'

export async function POST(request: Request) {
  try {
    // Parse request body defensively. Some runtimes (Edge, frameworks)
    // may expose a `.json()` helper; others only provide the standard
    // Fetch `Request` with `.text()`. Treat the parsed body as unknown
    // and validate its shape to avoid unsafe `any` usage.
    // Avoid casting to `any` — treat the incoming request as `unknown`
    // and detect a runtime `.json()` helper if present.
    const reqLike = request as unknown as { json?: unknown }
    const rawBody: unknown =
      typeof reqLike.json === 'function'
        ? await (reqLike.json as () => Promise<unknown>).call(request)
        : JSON.parse(await request.text())

    if (typeof rawBody !== 'object' || rawBody === null) {
      return new Response(
        JSON.stringify({ status: 'error', message: 'Invalid request body' }),
        { status: 400 },
      )
    }

    const body = rawBody as Record<string, unknown>

    const latitude =
      typeof body.latitude === 'number'
        ? body.latitude
        : typeof body.latitude === 'string'
          ? Number(body.latitude)
          : NaN

    const longitude =
      typeof body.longitude === 'number'
        ? body.longitude
        : typeof body.longitude === 'string'
          ? Number(body.longitude)
          : NaN

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return new Response(
        JSON.stringify({ status: 'error', message: 'Invalid coordinates' }),
        { status: 400 },
      )
    }
    // Here you would typically process the location data,
    // e.g., save it to a database or perform some calculations.
    console.log(
      `Received location: Latitude ${latitude}, Longitude ${longitude}`,
    )
    return new Response(JSON.stringify({ status: 'success' }), { status: 200 })
  } catch (error) {
    console.error('Error processing location data:', error)
    if (error instanceof Error) {
      return new Response(
        JSON.stringify({ status: 'error', message: error.message }),
        { status: 500 },
      )
    }
    return new Response(JSON.stringify({ status: 'error' }), { status: 500 })
  }
}

type RawPOIPoint = {
  id: string | number
  latitude: string
  longitude: string
  slug?: string
  type?: string
  families_pope?: unknown
  location_types_pope?: unknown
  plainWastes?: unknown
  plainTypes?: unknown
  plainFilters?: unknown
  // Enriched fields added by migration scripts
  name?: string
  address?: string
  phone?: string
  schedule?: string
  rating?: number | string
  company?: string
  wasteTypes?: string[]
}

type POIFile = {
  data: {
    publicGetMapInformation: {
      points: RawPOIPoint[]
    }
  }
}

export function GET() {
  try {
    // Build a GeoJSON FeatureCollection from the bundled POI sample file
    const poiFile = POI as unknown as POIFile
    const rawPoints = [...(poiFile.data.publicGetMapInformation.points ?? [])]

    rawPoints.push(
      ...getActiveEntries().map((entry) => ({
        id: `gps-${entry.id}`,
        latitude: entry.lat?.toString() ?? '0',
        longitude: entry.lng?.toString() ?? '0',
        slug: 'dynamic-gps-entry',
        type: 'gps',
      })),
    )

    const features: Feature<Point, POIProperties>[] = rawPoints
      .map((poi) => {
        const latitude = parseFloat(poi.latitude as unknown as string)
        const longitude = parseFloat(poi.longitude as unknown as string)
        if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null

        // Include enriched fields when available so the frontend can consume
        // a single unified FeatureCollection. New fields were added to the
        // bundled POI dataset (name, address, phone, schedule, rating,
        // company, wasteTypes) — surface them on the properties object so
        // consumers (map and list views) receive friendly data instead of
        // raw slugs.
        const properties: POIProperties = {
          id: poi.id,
          latitude,
          longitude,
          slug: poi.slug,
          type: poi.type,
          families_pope: poi.families_pope,
          location_types_pope: poi.location_types_pope,
          // legacy/raw fields (may be absent after migration)
          plainWastes: poi.plainWastes,
          plainTypes: poi.plainTypes,
          plainFilters: poi.plainFilters,
          // enriched fields added by the migration scripts
          name: poi.name,
          address: poi.address,
          phone: poi.phone,
          schedule: poi.schedule,
          rating:
            poi.rating === null || poi.rating === undefined
              ? undefined
              : typeof poi.rating === 'string'
                ? Number(poi.rating)
                : poi.rating,
          company: poi.company,
          wasteTypes: poi.wasteTypes,
        }

        const feature: Feature<Point, POIProperties> = {
          type: 'Feature',
          id: poi.id,
          properties,
          geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
        }

        return feature
      })
      .filter((f): f is Feature<Point, Record<string, unknown>> => f !== null)

    const featureCollection: FeatureCollection<
      Point,
      Record<string, unknown>
    > = {
      type: 'FeatureCollection',
      features,
    }

    // Validate the produced FeatureCollection against the zod schema.
    // If validation fails, return an error so consumers are aware.
    const parsed = FeatureCollectionSchema.safeParse(featureCollection)
    if (!parsed.success) {
      console.error(
        'Validation error building FeatureCollection:',
        parsed.error,
      )
      return new Response(
        JSON.stringify({ status: 'error', error: parsed.error }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    return new Response(JSON.stringify(parsed.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching location data:', error)
    if (error instanceof Error) {
      return new Response(
        JSON.stringify({ status: 'error', message: error.message }),
        { status: 500 },
      )
    }
    return new Response(JSON.stringify({ status: 'error' }), { status: 500 })
  }
}
