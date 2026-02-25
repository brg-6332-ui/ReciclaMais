export type InvalidReason = 'nan' | 'zero_zero' | 'out_of_pt_bbox' | 'fake_stub'

export type ValidCoordinate = {
  ok: true
}

export type InvalidCoordinate = {
  ok: false
  reason: InvalidReason
}

export type CoordinateClassification = ValidCoordinate | InvalidCoordinate

export const PT_BBOX = {
  minLat: 36.8,
  maxLat: 42.2,
  minLng: -9.8,
  maxLng: -6.0,
} as const

const EARTH_RADIUS_M = 6_371_000

export function haversineMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)

  const sinLat = Math.sin(dLat / 2)
  const sinLng = Math.sin(dLng / 2)
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng

  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h))
}

export function classifyCoordinate(
  lat: number,
  lng: number,
  options: {
    stubLat: number | null
    stubLng: number | null
    fakeStubRadiusM: number
  },
): CoordinateClassification {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { ok: false, reason: 'nan' }
  }

  if (lat === 0 && lng === 0) {
    return { ok: false, reason: 'zero_zero' }
  }

  if (
    lat < PT_BBOX.minLat ||
    lat > PT_BBOX.maxLat ||
    lng < PT_BBOX.minLng ||
    lng > PT_BBOX.maxLng
  ) {
    return { ok: false, reason: 'out_of_pt_bbox' }
  }

  if (options.stubLat !== null && options.stubLng !== null) {
    const d = haversineMeters(
      { lat, lng },
      { lat: options.stubLat, lng: options.stubLng },
    )
    if (d <= options.fakeStubRadiusM) {
      return { ok: false, reason: 'fake_stub' }
    }
  }

  return { ok: true }
}
