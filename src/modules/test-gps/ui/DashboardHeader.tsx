import { Activity } from 'lucide-solid'
import { Show } from 'solid-js'

import { Badge } from '~/components/ui/badge'
import { formatTimestamp, formatTtl } from '~/modules/test-gps/formatters'
import type { FetchStatus, GpsApiResponse } from '~/modules/test-gps/types'

/**
 * Hero/header section with title, status badge, and informational chips.
 */
export default function DashboardHeader(props: {
  status: FetchStatus
  data: GpsApiResponse | null
  lastUpdatedMs: number | null
  timezone: string
  windowH: number
}) {
  const statusBadge = () => {
    if (props.status === 'error') {
      return { label: 'Erro', class: 'bg-error/15 text-error border-error/30' }
    }
    if (!props.data || !props.lastUpdatedMs) {
      return {
        label: 'A aguardar',
        class: 'bg-warning/15 text-warning border-warning/30',
      }
    }
    const age = Date.now() - props.lastUpdatedMs
    if (age > 30_000) {
      return {
        label: 'Dados antigos',
        class: 'bg-warning/15 text-warning border-warning/30',
      }
    }
    return {
      label: 'Online',
      class: 'bg-success/15 text-success border-success/30',
    }
  }

  return (
    <div class="space-y-4">
      {/* Line 1: title + badge */}
      <div class="flex flex-col sm:flex-row sm:items-center gap-3">
        <div class="flex items-center gap-3">
          <div class="rounded-lg bg-primary-500/10 p-2.5">
            <Activity class="w-6 h-6 text-primary-500" />
          </div>
          <div>
            <h1 class="text-2xl md:text-3xl font-bold text-text-900 tracking-tight">
              Monitor de Qualidade GPS
            </h1>
            <p class="text-sm text-text-500 mt-0.5">
              Painel técnico de observabilidade — sessões, TTFF e outages
            </p>
          </div>
        </div>
        <div class="sm:ml-auto">
          <Badge class={`${statusBadge().class} text-xs`}>
            {statusBadge().label}
          </Badge>
        </div>
      </div>

      {/* Line 2: informational chips */}
      <div class="flex flex-wrap items-center gap-2">
        <Show when={props.lastUpdatedMs}>
          <Chip label="Última atualização">
            {formatTimestamp(props.lastUpdatedMs, props.timezone)}
          </Chip>
        </Show>
        <Show when={props.data}>
          <Chip label="TTL">{formatTtl(props.data!.gps.ttlMs)}</Chip>
        </Show>
        <Show when={props.data}>
          <Chip label="Timezone">
            {props.data!.gps.summary24h.window.timezone}
          </Chip>
        </Show>
        <Chip label="Janela">{`${props.windowH}h`}</Chip>
      </div>
    </div>
  )
}

/**
 * Small informational chip used in the header.
 */
function Chip(props: { label: string; children: string | number }) {
  return (
    <span class="inline-flex items-center gap-1.5 rounded-full border border-base-300 bg-base-100 px-3 py-1 text-xs">
      <span class="text-text-300">{props.label}:</span>
      <span class="font-medium text-text-700">{props.children}</span>
    </span>
  )
}
