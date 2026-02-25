import {
  AlertTriangle,
  Clock,
  Radio,
  RefreshCw,
  Timer,
  Wifi,
} from 'lucide-solid'
import type { Component } from 'solid-js'
import { For } from 'solid-js'

import { formatDurationMs } from '~/modules/test-gps/formatters'
import type { Summary24h } from '~/modules/test-gps/types'

type KpiItem = {
  label: string
  value: string
  subtitle: string
  icon: Component<{ class?: string }>
  colorClass: string
  bgClass: string
}

/**
 * Builds the KPI items array from the summary data.
 */
function buildKpis(summary: Summary24h): KpiItem[] {
  return [
    {
      label: 'Reconexões',
      value: String(summary.sessions.reconnect_total),
      subtitle: `${summary.window.hours}h — sessões`,
      icon: RefreshCw,
      colorClass: 'text-info',
      bgClass: 'bg-info/10',
    },
    {
      label: 'TTFF médio',
      value: formatDurationMs(summary.sessions.ttff.avg_ms),
      subtitle: `${summary.sessions.ttff.count} sessão(ões) com fix`,
      icon: Timer,
      colorClass: 'text-success',
      bgClass: 'bg-success/10',
    },
    {
      label: 'TTFF máximo',
      value: formatDurationMs(summary.sessions.ttff.max_ms),
      subtitle: 'Pior tempo até fix',
      icon: Clock,
      colorClass: 'text-warning',
      bgClass: 'bg-warning/10',
    },
    {
      label: 'Outages',
      value: String(summary.outages.count),
      subtitle: `${summary.window.hours}h — perda de fix`,
      icon: Wifi,
      colorClass: summary.outages.count > 0 ? 'text-error' : 'text-success',
      bgClass: summary.outages.count > 0 ? 'bg-error/10' : 'bg-success/10',
    },
    {
      label: 'Outages abertos',
      value: String(summary.outages.open_count),
      subtitle: 'Em curso agora',
      icon: AlertTriangle,
      colorClass:
        summary.outages.open_count > 0 ? 'text-error' : 'text-success',
      bgClass: summary.outages.open_count > 0 ? 'bg-error/10' : 'bg-success/10',
    },
    {
      label: 'Tempo sem fix',
      value: formatDurationMs(summary.outages.total_duration_ms),
      subtitle: `Máximo: ${formatDurationMs(summary.outages.max_duration_ms)}`,
      icon: Radio,
      colorClass: 'text-warning',
      bgClass: 'bg-warning/10',
    },
  ]
}

/**
 * Renders a single KPI card with icon, value, label and subtitle.
 */
function KpiCard(props: { kpi: KpiItem }) {
  return (
    <div class="rounded-lg border border-base-300 bg-base-100 p-4 hover:shadow-sm transition-shadow motion-reduce:transition-none">
      <div class="flex items-start gap-3">
        <div class={`rounded-md p-2 shrink-0 ${props.kpi.bgClass}`}>
          {(props.kpi.icon as Component<{ class?: string }>)({
            class: `w-4 h-4 ${props.kpi.colorClass}`,
          })}
        </div>
        <div class="min-w-0">
          <p class="text-xs text-text-300 truncate">{props.kpi.label}</p>
          <p class={`text-xl font-bold tracking-tight ${props.kpi.colorClass}`}>
            {props.kpi.value}
          </p>
          <p class="text-[11px] text-text-300 truncate mt-0.5">
            {props.kpi.subtitle}
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Grid of KPI cards for the GPS quality dashboard.
 */
export default function KpiCards(props: { summary: Summary24h }) {
  const kpis = () => buildKpis(props.summary)

  return (
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <For each={kpis()}>{(kpi) => <KpiCard kpi={kpi} />}</For>
    </div>
  )
}
