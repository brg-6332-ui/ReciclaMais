import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

import {
  computeReliability,
  type GpsPoint,
  type ReliabilityMetrics,
} from './metrics'
import {
  classifyCoordinate,
  type CoordinateClassification,
  type InvalidReason,
} from './quality'

type DbNumeric = number | string | null

type SessionRow = {
  id: string
  device_key: string
  created_at: string
  last_seen_at: string
  ended_at: string | null
  first_fix_at: string | null
  ttff_ms: DbNumeric
  last_valid_at: string | null
  last_valid_lat: number | null
  last_valid_lng: number | null
  stub_lat: number | null
  stub_lng: number | null
  open_outage_start_at: string | null
  open_outage_reason: string | null
  outage_count: DbNumeric
  outage_total_ms: DbNumeric
  outage_max_ms: DbNumeric
}

type OutageRow = {
  id: number
  session_id: string
  start_at: string
  end_at: string
  duration_ms: DbNumeric
  reason: string
  created_at: string
}

type RuntimeState = {
  points: GpsPoint[]
  consecutiveInvalidCount: number
  metrics: ReliabilityMetrics | null
}

export type GpsEntry = {
  id: string
  lat: number | null
  lng: number | null
  lastSeen: number
  quality: {
    first_fix_at_ms: number | null
    ttff_ms: number | null
    outage_count: number
    outage_total_ms: number
    outage_max_ms: number
    open_outage: boolean
    open_outage_reason: string | null
  }
}

export type UpdateEntryResult = {
  entry: GpsEntry
  ignored: boolean
  invalidReason: InvalidReason | null
  ttffMs: number | null
  metrics: ReliabilityMetrics | null
  last: GpsPoint | null
}

export type SummaryEvent = {
  session_id: string
  reason: string
  open: boolean
  start_ms: number
  end_ms: number
  clip_start_ms: number
  clip_end_ms: number
  clip_duration_ms: number
}

export type Summary24h = {
  window: {
    start_ms: number
    end_ms: number
    hours: number
    timezone: string
  }
  sessions: {
    count: number
    reconnect_total: number
    ttff: {
      count: number
      avg_ms: number
      max_ms: number
    }
  }
  outages: {
    count: number
    open_count: number
    total_duration_ms: number
    max_duration_ms: number
    by_hour: Record<string, number>
    events?: SummaryEvent[]
  }
}

export type SummaryOptions = {
  windowHours?: number
  timezone?: string | null
  includeOutageEvents?: boolean
  eventsLimit?: number
}

export type ClearAllTestDataResult = {
  ok: true
  mode: 'supabase' | 'memory'
  sessionsDeleted: number
  outagesDeleted: number
}

export const TTL_MS = 60_000
export const DEFAULT_SUMMARY_TIMEZONE = 'Europe/Lisbon'

const DEFAULT_DEVICE_KEY = 'default'
const OUTAGE_NO_VALID_TIMEOUT_MS = readNumberEnv(
  'GPS_OUTAGE_NO_VALID_TIMEOUT_MS',
  30_000,
)
const OUTAGE_INVALID_COUNT = readNumberEnv('GPS_OUTAGE_INVALID_COUNT', 2)
const FAKE_STUB_RADIUS_M = readNumberEnv('GPS_FAKE_STUB_RADIUS_M', 8)
const MAX_POINTS = readNumberEnv('GPS_MAX_POINTS', 600)
const JUMP_THRESHOLD_M = readNumberEnv('GPS_JUMP_THRESHOLD_M', 30)
const SUMMARY_MAX_HOURS = 24 * 7
const SUMMARY_DEFAULT_HOURS = 24
const SUMMARY_DEFAULT_EVENTS_LIMIT = 100
const SUMMARY_MAX_EVENTS_LIMIT = 500

const runtimeStore = new Map<string, RuntimeState>()

const memorySessions = new Map<string, SessionRow>()
const memoryOutages: OutageRow[] = []
let memoryOutageSeq = 1

const supabaseUrl = readEnv('VITE_PUBLIC_SUPABASE_URL')
const supabaseServiceRoleKey =
  readEnv('SUPABASE_SERVICE_ROLE_KEY') ??
  readEnv('VITE_PUBLIC_SUPABASE_ANON_KEY')

const supabase: SupabaseClient | null =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : null

function readEnv(name: string): string | null {
  const raw = import.meta.env[name] as string | undefined
  if (!raw) return null
  const trimmed = raw.trim()
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

function readNumberEnv(name: string, fallback: number): number {
  const raw = readEnv(name)
  if (!raw) return fallback
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) return fallback
  return n
}

function numericToNumber(value: DbNumeric, fallback = 0): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const n = Number(value)
    if (Number.isFinite(n)) return n
  }
  return fallback
}

function timestampToMs(value: string | null): number | null {
  if (!value) return null
  const ms = Date.parse(value)
  return Number.isFinite(ms) ? ms : null
}

function hourKeyFromMs(ms: number, timezone: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour: '2-digit',
    hour12: false,
  }).format(new Date(ms))
}

function normalizeTimeZone(tz?: string | null): string {
  if (!tz) return DEFAULT_SUMMARY_TIMEZONE
  try {
    new Intl.DateTimeFormat('en-GB', { timeZone: tz }).format(new Date())
    return tz
  } catch {
    return DEFAULT_SUMMARY_TIMEZONE
  }
}

function clampWindowHours(windowHours?: number): number {
  if (!windowHours || !Number.isFinite(windowHours))
    return SUMMARY_DEFAULT_HOURS
  const clamped = Math.floor(windowHours)
  if (clamped < 1) return 1
  if (clamped > SUMMARY_MAX_HOURS) return SUMMARY_MAX_HOURS
  return clamped
}

function clampEventsLimit(eventsLimit?: number): number {
  if (!eventsLimit || !Number.isFinite(eventsLimit))
    return SUMMARY_DEFAULT_EVENTS_LIMIT
  const clamped = Math.floor(eventsLimit)
  if (clamped < 1) return 1
  if (clamped > SUMMARY_MAX_EVENTS_LIMIT) return SUMMARY_MAX_EVENTS_LIMIT
  return clamped
}

function getRuntimeState(id: string): RuntimeState {
  const state = runtimeStore.get(id)
  if (state) return state
  const fresh: RuntimeState = {
    points: [],
    consecutiveInvalidCount: 0,
    metrics: null,
  }
  runtimeStore.set(id, fresh)
  return fresh
}

function toPublicEntry(row: SessionRow): GpsEntry {
  return {
    id: row.id,
    lat: row.last_valid_lat,
    lng: row.last_valid_lng,
    lastSeen: timestampToMs(row.last_seen_at) ?? Date.now(),
    quality: {
      first_fix_at_ms: timestampToMs(row.first_fix_at),
      ttff_ms: row.ttff_ms === null ? null : numericToNumber(row.ttff_ms),
      outage_count: numericToNumber(row.outage_count),
      outage_total_ms: numericToNumber(row.outage_total_ms),
      outage_max_ms: numericToNumber(row.outage_max_ms),
      open_outage: row.open_outage_start_at !== null,
      open_outage_reason: row.open_outage_reason,
    },
  }
}

async function getCanonicalNowIso(): Promise<string> {
  if (!supabase) return new Date().toISOString()

  const { data, error } = await supabase.rpc('gps_test_now')
  if (error) {
    console.warn(
      '[gps] failed to fetch db canonical time, using local clock',
      error,
    )
    return new Date().toISOString()
  }

  if (typeof data === 'string') {
    const ms = Date.parse(data)
    if (Number.isFinite(ms)) return new Date(ms).toISOString()
  }

  return new Date().toISOString()
}

async function getSessionByIdDb(id: string): Promise<SessionRow | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('gps_test_sessions')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('[gps] failed to load session by id', error)
    return null
  }

  return data
}

async function touchSessionDb(
  id: string,
  nowIso: string,
): Promise<SessionRow | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('gps_test_sessions')
    .update({ last_seen_at: nowIso })
    .eq('id', id)
    .is('ended_at', null)
    .select('*')
    .maybeSingle()

  if (error) {
    console.error('[gps] failed to touch session', error)
    return null
  }

  return data
}

async function tryOpenOutageByTimeoutDb(
  id: string,
  nowIso: string,
): Promise<boolean> {
  if (!supabase) return false

  const nowMs = timestampToMs(nowIso) ?? Date.now()
  const thresholdIso = new Date(
    nowMs - OUTAGE_NO_VALID_TIMEOUT_MS,
  ).toISOString()

  const { data, error } = await supabase
    .from('gps_test_sessions')
    .update({
      open_outage_start_at: nowIso,
      open_outage_reason: 'timeout_no_valid',
    })
    .eq('id', id)
    .is('ended_at', null)
    .is('open_outage_start_at', null)
    .not('first_fix_at', 'is', null)
    .not('last_valid_at', 'is', null)
    .lt('last_valid_at', thresholdIso)
    .select('id')

  if (error) {
    console.error('[gps] failed opening timeout outage', error)
    return false
  }

  return (data?.length ?? 0) > 0
}

async function tryOpenOutageByInvalidDb(
  id: string,
  nowIso: string,
  reason: InvalidReason,
): Promise<boolean> {
  if (!supabase) return false

  const { data, error } = await supabase
    .from('gps_test_sessions')
    .update({
      open_outage_start_at: nowIso,
      open_outage_reason: reason,
    })
    .eq('id', id)
    .is('ended_at', null)
    .is('open_outage_start_at', null)
    .not('first_fix_at', 'is', null)
    .not('last_valid_at', 'is', null)
    .select('id')

  if (error) {
    console.error('[gps] failed opening invalid outage', error)
    return false
  }

  return (data?.length ?? 0) > 0
}

async function closeOutageIfOpenDb(
  session: SessionRow,
  nowIso: string,
): Promise<SessionRow> {
  if (!supabase) return session
  if (!session.open_outage_start_at) return session

  const openStartMs = timestampToMs(session.open_outage_start_at)
  if (openStartMs === null) return session

  const nowMs = timestampToMs(nowIso) ?? Date.now()
  const durationMs = Math.max(0, nowMs - openStartMs)
  const nextOutageCount = numericToNumber(session.outage_count) + 1
  const nextOutageTotal = numericToNumber(session.outage_total_ms) + durationMs
  const nextOutageMax = Math.max(
    numericToNumber(session.outage_max_ms),
    durationMs,
  )

  const { data, error } = await supabase
    .from('gps_test_sessions')
    .update({
      open_outage_start_at: null,
      open_outage_reason: null,
      outage_count: nextOutageCount,
      outage_total_ms: nextOutageTotal,
      outage_max_ms: nextOutageMax,
      last_seen_at: nowIso,
    })
    .eq('id', session.id)
    .is('ended_at', null)
    .not('open_outage_start_at', 'is', null)
    .select('*')
    .maybeSingle()

  if (error) {
    console.error('[gps] failed closing outage', error)
    return session
  }

  if (!data) {
    const refreshed = await getSessionByIdDb(session.id)
    return refreshed ?? session
  }

  const { error: insertError } = await supabase
    .from('gps_test_outages')
    .insert({
      session_id: session.id,
      start_at: session.open_outage_start_at,
      end_at: nowIso,
      duration_ms: durationMs,
      reason: session.open_outage_reason ?? 'timeout_no_valid',
    })

  if (insertError) {
    console.error('[gps] failed inserting closed outage event', insertError)
  }

  return data
}

function closeOutageIfOpenMemory(
  session: SessionRow,
  nowIso: string,
): SessionRow {
  if (!session.open_outage_start_at) return session

  const openStartMs = timestampToMs(session.open_outage_start_at)
  const nowMs = timestampToMs(nowIso) ?? Date.now()
  if (openStartMs === null) return session

  const durationMs = Math.max(0, nowMs - openStartMs)

  const closed: OutageRow = {
    id: memoryOutageSeq,
    session_id: session.id,
    start_at: session.open_outage_start_at,
    end_at: nowIso,
    duration_ms: durationMs,
    reason: session.open_outage_reason ?? 'timeout_no_valid',
    created_at: nowIso,
  }

  memoryOutageSeq += 1
  memoryOutages.push(closed)

  return {
    ...session,
    open_outage_start_at: null,
    open_outage_reason: null,
    outage_count: numericToNumber(session.outage_count) + 1,
    outage_total_ms: numericToNumber(session.outage_total_ms) + durationMs,
    outage_max_ms: Math.max(numericToNumber(session.outage_max_ms), durationMs),
    last_seen_at: nowIso,
  }
}

function openOutageByTimeoutMemory(
  session: SessionRow,
  nowIso: string,
): SessionRow {
  if (session.open_outage_start_at) return session
  if (!session.first_fix_at || !session.last_valid_at) return session

  const nowMs = timestampToMs(nowIso) ?? Date.now()
  const lastValidMs = timestampToMs(session.last_valid_at)
  if (lastValidMs === null) return session

  if (nowMs - lastValidMs <= OUTAGE_NO_VALID_TIMEOUT_MS) {
    return session
  }

  return {
    ...session,
    open_outage_start_at: nowIso,
    open_outage_reason: 'timeout_no_valid',
  }
}

function openOutageByInvalidMemory(
  session: SessionRow,
  nowIso: string,
  reason: InvalidReason,
): SessionRow {
  if (session.open_outage_start_at) return session
  if (!session.first_fix_at || !session.last_valid_at) return session

  return {
    ...session,
    open_outage_start_at: nowIso,
    open_outage_reason: reason,
  }
}

function getActiveSessionMemory(deviceKey: string): SessionRow | null {
  for (const row of Array.from(memorySessions.values())) {
    if (row.device_key === deviceKey && row.ended_at === null) return row
  }
  return null
}

function withPoint(runtime: RuntimeState, point: GpsPoint): ReliabilityMetrics {
  runtime.points.push(point)
  if (runtime.points.length > MAX_POINTS) {
    runtime.points.shift()
  }
  const metrics = computeReliability(runtime.points, JUMP_THRESHOLD_M)
  runtime.metrics = metrics
  return metrics
}

async function createEntryDb(
  id: string,
  nowIso: string,
  stubLat: number | null,
  stubLng: number | null,
): Promise<string> {
  if (!supabase) return id

  const { data: active, error: activeError } = await supabase
    .from('gps_test_sessions')
    .select('*')
    .eq('device_key', DEFAULT_DEVICE_KEY)
    .is('ended_at', null)
    .order('created_at', { ascending: false })
    .limit(1)

  if (activeError) {
    console.error(
      '[gps] failed loading active session before create',
      activeError,
    )
  }

  const activeSession = active?.[0] ?? null
  if (activeSession) {
    const afterClose = await closeOutageIfOpenDb(activeSession, nowIso)
    const { error: closeError } = await supabase
      .from('gps_test_sessions')
      .update({ ended_at: nowIso, last_seen_at: nowIso })
      .eq('id', afterClose.id)
      .is('ended_at', null)

    if (closeError) {
      console.error('[gps] failed ending previous active session', closeError)
    }
  }

  const { error: insertError } = await supabase
    .from('gps_test_sessions')
    .insert({
      id,
      device_key: DEFAULT_DEVICE_KEY,
      created_at: nowIso,
      last_seen_at: nowIso,
      ended_at: null,
      first_fix_at: null,
      ttff_ms: null,
      last_valid_at: null,
      last_valid_lat: null,
      last_valid_lng: null,
      stub_lat: stubLat,
      stub_lng: stubLng,
      open_outage_start_at: null,
      open_outage_reason: null,
      outage_count: 0,
      outage_total_ms: 0,
      outage_max_ms: 0,
    })

  if (insertError) {
    console.error('[gps] failed creating gps session', insertError)
    throw insertError
  }

  return id
}

function createEntryMemory(
  id: string,
  nowIso: string,
  stubLat: number | null,
  stubLng: number | null,
): string {
  const activeSession = getActiveSessionMemory(DEFAULT_DEVICE_KEY)
  if (activeSession) {
    const afterClose = closeOutageIfOpenMemory(activeSession, nowIso)
    memorySessions.set(activeSession.id, {
      ...afterClose,
      ended_at: nowIso,
      last_seen_at: nowIso,
    })
  }

  const row: SessionRow = {
    id,
    device_key: DEFAULT_DEVICE_KEY,
    created_at: nowIso,
    last_seen_at: nowIso,
    ended_at: null,
    first_fix_at: null,
    ttff_ms: null,
    last_valid_at: null,
    last_valid_lat: null,
    last_valid_lng: null,
    stub_lat: stubLat,
    stub_lng: stubLng,
    open_outage_start_at: null,
    open_outage_reason: null,
    outage_count: 0,
    outage_total_ms: 0,
    outage_max_ms: 0,
  }

  memorySessions.set(id, row)
  return id
}

export async function createEntry(
  lat: number | null = null,
  lng: number | null = null,
): Promise<string> {
  const id = randomUUID()
  const nowIso = await getCanonicalNowIso()
  const stubLat = Number.isFinite(lat) ? lat : null
  const stubLng = Number.isFinite(lng) ? lng : null

  if (supabase) {
    await createEntryDb(id, nowIso, stubLat, stubLng)
  } else {
    createEntryMemory(id, nowIso, stubLat, stubLng)
  }

  runtimeStore.set(id, {
    points: [],
    consecutiveInvalidCount: 0,
    metrics: null,
  })

  return id
}

async function heartbeatDb(id: string): Promise<boolean> {
  const nowIso = await getCanonicalNowIso()
  const touched = await touchSessionDb(id, nowIso)
  if (!touched) return false

  await tryOpenOutageByTimeoutDb(id, nowIso)
  return true
}

function heartbeatMemory(id: string): boolean {
  const row = memorySessions.get(id)
  if (!row || row.ended_at !== null) return false

  const nowIso = new Date().toISOString()
  let next = { ...row, last_seen_at: nowIso }
  next = openOutageByTimeoutMemory(next, nowIso)
  memorySessions.set(id, next)
  return true
}

export async function heartbeat(id: string): Promise<boolean> {
  if (supabase) return heartbeatDb(id)
  return heartbeatMemory(id)
}

async function clearAllTestDataDb(): Promise<ClearAllTestDataResult> {
  if (!supabase) {
    return clearAllTestDataMemory()
  }

  const { count: outagesDeleted, error: outagesError } = await supabase
    .from('gps_test_outages')
    .delete({ count: 'exact' })
    .not('id', 'is', null)

  if (outagesError) {
    throw outagesError
  }

  const { count: sessionsDeleted, error: sessionsError } = await supabase
    .from('gps_test_sessions')
    .delete({ count: 'exact' })
    .not('id', 'is', null)

  if (sessionsError) {
    throw sessionsError
  }

  runtimeStore.clear()
  memorySessions.clear()
  memoryOutages.length = 0
  memoryOutageSeq = 1

  return {
    ok: true,
    mode: 'supabase',
    sessionsDeleted: sessionsDeleted ?? 0,
    outagesDeleted: outagesDeleted ?? 0,
  }
}

function clearAllTestDataMemory(): ClearAllTestDataResult {
  const sessionsDeleted = memorySessions.size
  const outagesDeleted = memoryOutages.length

  memorySessions.clear()
  memoryOutages.length = 0
  memoryOutageSeq = 1
  runtimeStore.clear()

  return {
    ok: true,
    mode: 'memory',
    sessionsDeleted,
    outagesDeleted,
  }
}

export async function clearAllTestData(): Promise<ClearAllTestDataResult> {
  if (supabase) return clearAllTestDataDb()
  return clearAllTestDataMemory()
}

function classifyForSession(
  session: SessionRow,
  lat: number,
  lng: number,
): CoordinateClassification {
  return classifyCoordinate(lat, lng, {
    stubLat: session.stub_lat,
    stubLng: session.stub_lng,
    fakeStubRadiusM: FAKE_STUB_RADIUS_M,
  })
}

async function updateValidDb(
  session: SessionRow,
  lat: number,
  lng: number,
  nowIso: string,
): Promise<SessionRow | null> {
  if (!supabase) return null

  const nowMs = timestampToMs(nowIso) ?? Date.now()

  if (session.first_fix_at === null) {
    const createdMs = timestampToMs(session.created_at) ?? nowMs
    const ttffMs = Math.max(0, nowMs - createdMs)

    const { data, error } = await supabase
      .from('gps_test_sessions')
      .update({
        last_seen_at: nowIso,
        last_valid_at: nowIso,
        last_valid_lat: lat,
        last_valid_lng: lng,
        first_fix_at: nowIso,
        ttff_ms: ttffMs,
      })
      .eq('id', session.id)
      .is('ended_at', null)
      .is('first_fix_at', null)
      .select('*')
      .maybeSingle()

    if (error) {
      console.error('[gps] failed applying first fix update', error)
      return null
    }

    if (data) return data
  }

  const { data, error } = await supabase
    .from('gps_test_sessions')
    .update({
      last_seen_at: nowIso,
      last_valid_at: nowIso,
      last_valid_lat: lat,
      last_valid_lng: lng,
    })
    .eq('id', session.id)
    .is('ended_at', null)
    .select('*')
    .maybeSingle()

  if (error) {
    console.error('[gps] failed applying valid update', error)
    return null
  }

  return data
}

async function updateInvalidDb(
  session: SessionRow,
  nowIso: string,
): Promise<SessionRow | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('gps_test_sessions')
    .update({ last_seen_at: nowIso })
    .eq('id', session.id)
    .is('ended_at', null)
    .select('*')
    .maybeSingle()

  if (error) {
    console.error('[gps] failed applying invalid update touch', error)
    return null
  }

  return data
}

async function updateEntryDb(
  id: string,
  lat: number,
  lng: number,
): Promise<UpdateEntryResult | null> {
  const nowIso = await getCanonicalNowIso()

  let session = await getSessionByIdDb(id)
  if (!session || session.ended_at !== null) return null

  const runtime = getRuntimeState(id)
  const classification = classifyForSession(session, lat, lng)

  let ignored = false
  let invalidReason: InvalidReason | null = null
  let last: GpsPoint | null = null
  let metrics: ReliabilityMetrics | null = runtime.metrics

  if (classification.ok) {
    runtime.consecutiveInvalidCount = 0

    const updated = await updateValidDb(session, lat, lng, nowIso)
    if (!updated) return null

    session = updated

    last = {
      lat,
      lng,
      t: timestampToMs(nowIso) ?? Date.now(),
    }
    metrics = withPoint(runtime, last)

    session = await closeOutageIfOpenDb(session, nowIso)
  } else {
    ignored = true
    invalidReason = classification.reason
    runtime.consecutiveInvalidCount += 1

    const updated = await updateInvalidDb(session, nowIso)
    if (!updated) return null

    session = updated

    const nowMs = timestampToMs(nowIso) ?? Date.now()
    const lastValidMs = timestampToMs(session.last_valid_at)
    const timeoutExceeded =
      lastValidMs !== null && nowMs - lastValidMs > OUTAGE_NO_VALID_TIMEOUT_MS

    if (
      runtime.consecutiveInvalidCount >= OUTAGE_INVALID_COUNT &&
      !timeoutExceeded
    ) {
      await tryOpenOutageByInvalidDb(id, nowIso, classification.reason)
    }
  }

  await tryOpenOutageByTimeoutDb(id, nowIso)

  const refreshed = await getSessionByIdDb(id)
  const finalSession = refreshed ?? session

  return {
    entry: toPublicEntry(finalSession),
    ignored,
    invalidReason,
    ttffMs:
      finalSession.ttff_ms === null
        ? null
        : numericToNumber(finalSession.ttff_ms),
    metrics,
    last,
  }
}

function updateEntryMemory(
  id: string,
  lat: number,
  lng: number,
): UpdateEntryResult | null {
  const nowIso = new Date().toISOString()
  const nowMs = timestampToMs(nowIso) ?? Date.now()

  const session = memorySessions.get(id)
  if (!session || session.ended_at !== null) return null

  const runtime = getRuntimeState(id)
  const classification = classifyForSession(session, lat, lng)
  let nextSession = { ...session, last_seen_at: nowIso }

  let ignored = false
  let invalidReason: InvalidReason | null = null
  let last: GpsPoint | null = null
  let metrics: ReliabilityMetrics | null = runtime.metrics

  if (classification.ok) {
    runtime.consecutiveInvalidCount = 0

    if (!nextSession.first_fix_at) {
      const createdMs = timestampToMs(nextSession.created_at) ?? nowMs
      nextSession.first_fix_at = nowIso
      nextSession.ttff_ms = Math.max(0, nowMs - createdMs)
    }

    nextSession.last_valid_at = nowIso
    nextSession.last_valid_lat = lat
    nextSession.last_valid_lng = lng

    last = { lat, lng, t: nowMs }
    metrics = withPoint(runtime, last)

    nextSession = closeOutageIfOpenMemory(nextSession, nowIso)
  } else {
    ignored = true
    invalidReason = classification.reason
    runtime.consecutiveInvalidCount += 1

    const lastValidMs = timestampToMs(nextSession.last_valid_at)
    const timeoutExceeded =
      lastValidMs !== null && nowMs - lastValidMs > OUTAGE_NO_VALID_TIMEOUT_MS

    if (
      runtime.consecutiveInvalidCount >= OUTAGE_INVALID_COUNT &&
      !timeoutExceeded
    ) {
      nextSession = openOutageByInvalidMemory(
        nextSession,
        nowIso,
        classification.reason,
      )
    }
  }

  nextSession = openOutageByTimeoutMemory(nextSession, nowIso)
  memorySessions.set(id, nextSession)

  return {
    entry: toPublicEntry(nextSession),
    ignored,
    invalidReason,
    ttffMs:
      nextSession.ttff_ms === null
        ? null
        : numericToNumber(nextSession.ttff_ms),
    metrics,
    last,
  }
}

export async function updateEntry(
  id: string,
  lat: number,
  lng: number,
): Promise<UpdateEntryResult | null> {
  if (supabase) return updateEntryDb(id, lat, lng)
  return updateEntryMemory(id, lat, lng)
}

async function getActiveEntriesDb(): Promise<GpsEntry[]> {
  if (!supabase) return []

  const nowIso = await getCanonicalNowIso()
  const nowMs = timestampToMs(nowIso) ?? Date.now()
  const thresholdIso = new Date(nowMs - TTL_MS).toISOString()

  const { data, error } = await supabase
    .from('gps_test_sessions')
    .select('*')
    .is('ended_at', null)
    .gte('last_seen_at', thresholdIso)
    .order('last_seen_at', { ascending: false })

  if (error) {
    console.error('[gps] failed listing active sessions', error)
    return []
  }

  return (data ?? []).map((row) => toPublicEntry(row))
}

function getActiveEntriesMemory(): GpsEntry[] {
  const nowMs = Date.now()

  return Array.from(memorySessions.values())
    .filter((row) => {
      if (row.ended_at !== null) return false
      const lastSeen = timestampToMs(row.last_seen_at)
      if (lastSeen === null) return false
      return nowMs - lastSeen <= TTL_MS
    })
    .map((row) => toPublicEntry(row))
}

export async function getActiveEntries(): Promise<GpsEntry[]> {
  if (supabase) return getActiveEntriesDb()
  return getActiveEntriesMemory()
}

type ClipCandidate = {
  sessionId: string
  reason: string
  open: boolean
  startMs: number
  endMs: number
}

type ClipResult = {
  session_id: string
  reason: string
  open: boolean
  start_ms: number
  end_ms: number
  clip_start_ms: number
  clip_end_ms: number
  clip_duration_ms: number
}

function clipOutage(
  candidate: ClipCandidate,
  windowStartMs: number,
  windowEndMs: number,
): ClipResult | null {
  const clipStart = Math.max(candidate.startMs, windowStartMs)
  const clipEnd = Math.min(candidate.endMs, windowEndMs)
  if (clipEnd <= clipStart) return null

  return {
    session_id: candidate.sessionId,
    reason: candidate.reason,
    open: candidate.open,
    start_ms: candidate.startMs,
    end_ms: candidate.endMs,
    clip_start_ms: clipStart,
    clip_end_ms: clipEnd,
    clip_duration_ms: clipEnd - clipStart,
  }
}

function buildSummaryFromData(
  nowMs: number,
  hours: number,
  timezone: string,
  includeOutageEvents: boolean,
  eventsLimit: number,
  sessions: Array<Pick<SessionRow, 'id' | 'ttff_ms'>>,
  closedOutages: Array<
    Pick<OutageRow, 'session_id' | 'start_at' | 'end_at' | 'reason'>
  >,
  openOutages: Array<
    Pick<SessionRow, 'id' | 'open_outage_start_at' | 'open_outage_reason'>
  >,
): Summary24h {
  const windowEndMs = nowMs
  const windowStartMs = windowEndMs - hours * 60 * 60 * 1000

  const ttffValues = sessions
    .map((s) => (s.ttff_ms === null ? null : numericToNumber(s.ttff_ms)))
    .filter((value): value is number => value !== null)

  const ttffCount = ttffValues.length
  const ttffAvg =
    ttffCount === 0
      ? 0
      : Math.round(
          ttffValues.reduce((acc, value) => acc + value, 0) / ttffCount,
        )
  const ttffMax = ttffCount === 0 ? 0 : Math.max(...ttffValues)

  const byHour: Record<string, number> = {}
  const clippedEvents: SummaryEvent[] = []

  let outageCount = 0
  let openCount = 0
  let totalDurationMs = 0
  let maxDurationMs = 0

  for (const outage of closedOutages) {
    const startMs = timestampToMs(outage.start_at)
    const endMs = timestampToMs(outage.end_at)
    if (startMs === null || endMs === null) continue

    const clipped = clipOutage(
      {
        sessionId: outage.session_id,
        reason: outage.reason,
        open: false,
        startMs,
        endMs,
      },
      windowStartMs,
      windowEndMs,
    )

    if (!clipped) continue

    outageCount += 1
    totalDurationMs += clipped.clip_duration_ms
    maxDurationMs = Math.max(maxDurationMs, clipped.clip_duration_ms)

    const hourKey = hourKeyFromMs(clipped.clip_start_ms, timezone)
    byHour[hourKey] = (byHour[hourKey] ?? 0) + 1

    if (includeOutageEvents) clippedEvents.push(clipped)
  }

  for (const openOutage of openOutages) {
    const startMs = timestampToMs(openOutage.open_outage_start_at)
    if (startMs === null) continue

    const clipped = clipOutage(
      {
        sessionId: openOutage.id,
        reason: openOutage.open_outage_reason ?? 'timeout_no_valid',
        open: true,
        startMs,
        endMs: windowEndMs,
      },
      windowStartMs,
      windowEndMs,
    )

    if (!clipped) continue

    outageCount += 1
    openCount += 1
    totalDurationMs += clipped.clip_duration_ms
    maxDurationMs = Math.max(maxDurationMs, clipped.clip_duration_ms)

    const hourKey = hourKeyFromMs(clipped.clip_start_ms, timezone)
    byHour[hourKey] = (byHour[hourKey] ?? 0) + 1

    if (includeOutageEvents) clippedEvents.push(clipped)
  }

  const summary: Summary24h = {
    window: {
      start_ms: windowStartMs,
      end_ms: windowEndMs,
      hours,
      timezone,
    },
    sessions: {
      count: sessions.length,
      reconnect_total: sessions.length,
      ttff: {
        count: ttffCount,
        avg_ms: ttffAvg,
        max_ms: ttffMax,
      },
    },
    outages: {
      count: outageCount,
      open_count: openCount,
      total_duration_ms: totalDurationMs,
      max_duration_ms: maxDurationMs,
      by_hour: byHour,
    },
  }

  if (includeOutageEvents) {
    summary.outages.events = clippedEvents
      .sort((a, b) => b.clip_start_ms - a.clip_start_ms)
      .slice(0, eventsLimit)
  }

  return summary
}

async function getSummary24hDb(options: SummaryOptions): Promise<Summary24h> {
  if (!supabase) {
    return getSummary24hMemory(options)
  }

  const timezone = normalizeTimeZone(options.timezone)
  const hours = clampWindowHours(options.windowHours)
  const includeOutageEvents = options.includeOutageEvents ?? false
  const eventsLimit = clampEventsLimit(options.eventsLimit)

  const nowIso = await getCanonicalNowIso()
  const nowMs = timestampToMs(nowIso) ?? Date.now()
  const windowStartIso = new Date(nowMs - hours * 60 * 60 * 1000).toISOString()

  const [
    { data: sessionsData, error: sessionsError },
    { data: outagesData, error: outagesError },
    { data: openData, error: openError },
  ] = await Promise.all([
    supabase
      .from('gps_test_sessions')
      .select('id, ttff_ms')
      .eq('device_key', DEFAULT_DEVICE_KEY)
      .gte('created_at', windowStartIso)
      .lt('created_at', nowIso),
    supabase
      .from('gps_test_outages')
      .select('session_id, start_at, end_at, reason')
      .lt('start_at', nowIso)
      .gt('end_at', windowStartIso),
    supabase
      .from('gps_test_sessions')
      .select('id, open_outage_start_at, open_outage_reason')
      .eq('device_key', DEFAULT_DEVICE_KEY)
      .is('ended_at', null)
      .not('open_outage_start_at', 'is', null)
      .lt('open_outage_start_at', nowIso),
  ])

  if (sessionsError)
    console.error('[gps] failed loading summary sessions', sessionsError)
  if (outagesError)
    console.error('[gps] failed loading summary outages', outagesError)
  if (openError)
    console.error('[gps] failed loading summary open outages', openError)

  return buildSummaryFromData(
    nowMs,
    hours,
    timezone,
    includeOutageEvents,
    eventsLimit,
    sessionsData ?? [],
    outagesData ?? [],
    openData ?? [],
  )
}

function getSummary24hMemory(options: SummaryOptions): Summary24h {
  const timezone = normalizeTimeZone(options.timezone)
  const hours = clampWindowHours(options.windowHours)
  const includeOutageEvents = options.includeOutageEvents ?? false
  const eventsLimit = clampEventsLimit(options.eventsLimit)

  const nowMs = Date.now()
  const windowStartMs = nowMs - hours * 60 * 60 * 1000

  const sessions = Array.from(memorySessions.values())
    .filter((row) => {
      const createdMs = timestampToMs(row.created_at)
      if (createdMs === null) return false
      return createdMs >= windowStartMs && createdMs < nowMs
    })
    .map((row) => ({ id: row.id, ttff_ms: row.ttff_ms }))

  const closedOutages = memoryOutages
    .filter((row) => {
      const startMs = timestampToMs(row.start_at)
      const endMs = timestampToMs(row.end_at)
      if (startMs === null || endMs === null) return false
      return startMs < nowMs && endMs > windowStartMs
    })
    .map((row) => ({
      session_id: row.session_id,
      start_at: row.start_at,
      end_at: row.end_at,
      reason: row.reason,
    }))

  const openOutages = Array.from(memorySessions.values())
    .filter((row) => row.ended_at === null && row.open_outage_start_at !== null)
    .map((row) => ({
      id: row.id,
      open_outage_start_at: row.open_outage_start_at,
      open_outage_reason: row.open_outage_reason,
    }))

  const summary = buildSummaryFromData(
    nowMs,
    hours,
    timezone,
    includeOutageEvents,
    eventsLimit,
    sessions,
    closedOutages,
    openOutages,
  )

  return summary
}

export async function getSummary24h(
  options: SummaryOptions = {},
): Promise<Summary24h> {
  if (supabase) return getSummary24hDb(options)
  return getSummary24hMemory(options)
}
