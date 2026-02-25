import { haversineMeters } from './quality'

export type GpsPoint = {
  lat: number
  lng: number
  t: number
}

export type ReliabilityMetrics = {
  jitter_p50_m: number
  jitter_p95_m: number
  jump_count: number
  jump_max_m: number
  sample_size: number
}

function sortNumbers(values: number[]): number[] {
  return [...values].sort((a, b) => a - b)
}

export function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = sortNumbers(values)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2
  }
  return sorted[mid]
}

export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0
  const sorted = sortNumbers(values)
  const ratio = Math.max(0, Math.min(1, p))
  const idx = Math.min(
    sorted.length - 1,
    Math.floor(ratio * (sorted.length - 1)),
  )
  return sorted[idx]
}

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

export function computeReliability(
  points: GpsPoint[],
  jumpThresholdM: number,
): ReliabilityMetrics {
  if (points.length === 0) {
    return {
      jitter_p50_m: 0,
      jitter_p95_m: 0,
      jump_count: 0,
      jump_max_m: 0,
      sample_size: 0,
    }
  }

  const centerLat = median(points.map((p) => p.lat))
  const centerLng = median(points.map((p) => p.lng))
  const center = { lat: centerLat, lng: centerLng }

  const jitters = points.map((p) => haversineMeters(center, p))
  const jitterP50 = percentile(jitters, 0.5)
  const jitterP95 = percentile(jitters, 0.95)

  let jumpCount = 0
  let jumpMax = 0

  for (let i = 1; i < points.length; i += 1) {
    const d = haversineMeters(points[i - 1], points[i])
    if (d > jumpThresholdM) {
      jumpCount += 1
      if (d > jumpMax) jumpMax = d
    }
  }

  return {
    jitter_p50_m: round1(jitterP50),
    jitter_p95_m: round1(jitterP95),
    jump_count: jumpCount,
    jump_max_m: round1(jumpMax),
    sample_size: points.length,
  }
}
