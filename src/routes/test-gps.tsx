import { useSearchParams } from '@solidjs/router'
import { AlertTriangle, RefreshCw } from 'lucide-solid'
import { createEffect, For, Show } from 'solid-js'

import { Button } from '~/components/ui/button'
import { useGpsDashboard } from '~/modules/test-gps/hooks/useGpsDashboard'
import type { GpsFilters } from '~/modules/test-gps/types'
import ControlBar from '~/modules/test-gps/ui/ControlBar'
import DashboardHeader from '~/modules/test-gps/ui/DashboardHeader'
import KpiCards from '~/modules/test-gps/ui/KpiCards'
import OutageByHourBars from '~/modules/test-gps/ui/OutageByHourBars'
import OutageEventsPanel from '~/modules/test-gps/ui/OutageEventsPanel'
import RawPayloadPanel from '~/modules/test-gps/ui/RawPayloadPanel'
import SessionsTable from '~/modules/test-gps/ui/SessionsTable'

/**
 * Parses query string into initial filter values.
 */
function parseInitialFilters(
  params: Record<string, string | undefined>,
): GpsFilters {
  const windowH = Number(params.window_h)
  const eventsLimit = Number(params.events_limit)

  return {
    windowH: Number.isFinite(windowH) && windowH > 0 ? windowH : 24,
    tz: params.tz?.trim() || 'Europe/Lisbon',
    includeOutageEvents:
      params.include_outage_events === '1' ||
      params.include_outage_events === 'true',
    eventsLimit:
      Number.isFinite(eventsLimit) && eventsLimit > 0 ? eventsLimit : 100,
  }
}

/**
 * GPS Quality Monitor — technical observability dashboard.
 * Route: /test-gps
 */
export default function TestGPS() {
  const [searchParams, setSearchParams] = useSearchParams()

  const initial = parseInitialFilters(
    searchParams as Record<string, string | undefined>,
  )

  const dashboard = useGpsDashboard(initial)

  // Sync filters to query string
  createEffect(() => {
    const f = dashboard.filters()
    setSearchParams(
      {
        window_h: String(f.windowH),
        tz: f.tz,
        include_outage_events: f.includeOutageEvents ? '1' : undefined,
        events_limit: f.includeOutageEvents ? String(f.eventsLimit) : undefined,
      },
      { replace: true },
    )
  })

  const summary = () => dashboard.data()?.gps.summary24h ?? null
  const entries = () => dashboard.data()?.gps.entries ?? []
  const outageEvents = () => summary()?.outages.events ?? []
  const byHour = () => summary()?.outages.by_hour ?? {}
  const timezone = () => summary()?.window.timezone ?? dashboard.filters().tz
  const isWindowEmpty = () => {
    const s = summary()
    if (!s) return false
    return (
      entries().length === 0 && s.sessions.count === 0 && s.outages.count === 0
    )
  }

  return (
    <div class="min-h-screen">
      {/* Background gradient */}
      <div
        class="fixed inset-0 -z-10 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse at 20% 0%, var(--color-primary-100) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, var(--color-accent-100) 0%, transparent 50%)',
          opacity: '0.4',
        }}
      />

      <div class="container mx-auto px-4 py-8 space-y-6 max-w-7xl">
        {/* Hero / Header */}
        <DashboardHeader
          status={dashboard.status()}
          data={dashboard.data()}
          lastUpdatedMs={dashboard.lastUpdatedMs()}
          timezone={timezone()}
          windowH={dashboard.filters().windowH}
        />

        {/* Control Bar */}
        <ControlBar
          filters={dashboard.filters()}
          paused={dashboard.paused()}
          loading={dashboard.status() === 'loading'}
          onFiltersChange={(f) => dashboard.setFilters(f)}
          onApply={() => dashboard.fetchData()}
          onRefresh={() => dashboard.fetchData()}
          onTogglePause={() => dashboard.togglePause()}
        />

        {/* Error Banner */}
        <Show when={dashboard.error()}>
          <div
            class="rounded-lg border border-error/30 bg-error/10 p-4 flex items-start gap-3"
            role="alert"
          >
            <AlertTriangle class="w-5 h-5 text-error shrink-0 mt-0.5" />
            <div class="space-y-1">
              <p class="text-sm font-medium text-error">Erro ao obter dados</p>
              <p class="text-xs text-error/80">{dashboard.error()}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              class="ml-auto shrink-0"
              onClick={() => dashboard.fetchData()}
            >
              <RefreshCw class="w-3.5 h-3.5" />
              Tentar novamente
            </Button>
          </div>
        </Show>

        {/* Loading skeleton */}
        <Show
          when={dashboard.status() !== 'loading' || dashboard.data()}
          fallback={<SkeletonDashboard />}
        >
          <Show
            when={dashboard.status() !== 'success' || !isWindowEmpty()}
            fallback={<EmptyState onRefresh={() => dashboard.fetchData()} />}
          >
            {/* KPI Cards */}
            <Show when={summary()}>{(s) => <KpiCards summary={s()} />}</Show>

            {/* Two-column content */}
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Column A — Sessions */}
              <div class="rounded-lg border border-base-300 bg-base-100 p-5 space-y-3">
                <h2 class="text-sm font-semibold text-text-700">
                  Sessões Ativas
                </h2>
                <SessionsTable entries={entries()} />
              </div>

              {/* Column B — Outages by hour */}
              <div class="rounded-lg border border-base-300 bg-base-100 p-5 space-y-3">
                <h2 class="text-sm font-semibold text-text-700">
                  Outages por Hora
                </h2>
                <OutageByHourBars byHour={byHour()} />
              </div>
            </div>

            {/* Outage Events (conditional) */}
            <Show when={dashboard.filters().includeOutageEvents}>
              <div class="rounded-lg border border-base-300 bg-base-100 p-5 space-y-3">
                <h2 class="text-sm font-semibold text-text-700">
                  Eventos de Outage
                </h2>
                <OutageEventsPanel
                  events={outageEvents()}
                  timezone={timezone()}
                />
              </div>
            </Show>

            {/* Raw Payload */}
            <Show when={dashboard.data()}>
              <RawPayloadPanel data={dashboard.data()} />
            </Show>
          </Show>
        </Show>
      </div>
    </div>
  )
}

/**
 * Skeleton loading state for the dashboard.
 */
function SkeletonDashboard() {
  return (
    <div class="space-y-6 animate-pulse">
      {/* KPI skeletons */}
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <For each={Array.from({ length: 6 })}>
          {() => (
            <div class="rounded-lg border border-base-300 bg-base-100 p-4 h-24" />
          )}
        </For>
      </div>

      {/* Two-column skeletons */}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="rounded-lg border border-base-300 bg-base-100 p-5 h-64" />
        <div class="rounded-lg border border-base-300 bg-base-100 p-5 h-64" />
      </div>
    </div>
  )
}

/**
 * Empty state when the API returns no data.
 */
function EmptyState(props: { onRefresh: () => void }) {
  return (
    <div class="text-center py-16 space-y-4">
      <div class="rounded-full bg-base-200 w-16 h-16 flex items-center justify-center mx-auto">
        <AlertTriangle class="w-8 h-8 text-text-300" />
      </div>
      <div class="space-y-1">
        <p class="text-lg font-medium text-text-700">Sem dados disponíveis</p>
        <p class="text-sm text-text-300 max-w-md mx-auto">
          Não existem sessões GPS ativas nem dados de qualidade na janela
          selecionada. Verifique se o dispositivo está a enviar dados.
        </p>
      </div>
      <Button variant="outline" onClick={() => props.onRefresh()}>
        <RefreshCw class="w-4 h-4" />
        Atualizar agora
      </Button>
    </div>
  )
}
