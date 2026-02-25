import { For, Show } from 'solid-js'

import { Badge } from '~/components/ui/badge'
import {
  formatDurationMs,
  formatTime,
  shortId,
} from '~/modules/test-gps/formatters'
import type { SummaryEvent } from '~/modules/test-gps/types'

/**
 * Table listing individual outage events with clipped durations.
 * Only rendered when include_outage_events is enabled.
 */
export default function OutageEventsPanel(props: {
  events: SummaryEvent[]
  timezone: string
}) {
  return (
    <div class="w-full">
      <Show
        when={props.events.length > 0}
        fallback={
          <div class="text-center py-6 text-text-300 text-sm">
            <p>Sem eventos de outage na janela atual.</p>
          </div>
        }
      >
        {/* Desktop table */}
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-base-300 text-left text-text-500">
                <th class="pb-3 pr-4 font-medium">Sessão</th>
                <th class="pb-3 pr-4 font-medium">Motivo</th>
                <th class="pb-3 pr-4 font-medium">Início (clipado)</th>
                <th class="pb-3 pr-4 font-medium">Fim (clipado)</th>
                <th class="pb-3 pr-4 font-medium">Duração (clipada)</th>
                <th class="pb-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              <For each={props.events}>
                {(event) => (
                  <tr class="border-b border-base-200 hover:bg-base-200/50 transition-colors">
                    <td class="py-3 pr-4">
                      <code class="text-xs font-mono bg-base-200 px-1.5 py-0.5 rounded">
                        {shortId(event.session_id)}
                      </code>
                    </td>
                    <td class="py-3 pr-4 text-text-500 text-xs">
                      {event.reason}
                    </td>
                    <td class="py-3 pr-4 font-mono text-xs text-text-500">
                      {formatTime(event.clip_start_ms, props.timezone)}
                    </td>
                    <td class="py-3 pr-4 font-mono text-xs text-text-500">
                      <Show
                        when={!event.open}
                        fallback={
                          <span class="italic text-warning">em curso</span>
                        }
                      >
                        {formatTime(event.clip_end_ms, props.timezone)}
                      </Show>
                    </td>
                    <td class="py-3 pr-4 font-mono text-xs">
                      {formatDurationMs(event.clip_duration_ms)}
                      <Show when={event.open}>
                        <span class="text-warning ml-1">(parcial)</span>
                      </Show>
                    </td>
                    <td class="py-3">
                      <Show
                        when={event.open}
                        fallback={
                          <Badge class="bg-base-200 text-text-500 border-base-300 text-xs">
                            Fechado
                          </Badge>
                        }
                      >
                        <Badge class="bg-warning/15 text-warning border-warning/30 text-xs">
                          Aberto
                        </Badge>
                      </Show>
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div class="md:hidden space-y-3">
          <For each={props.events}>
            {(event) => (
              <div class="rounded-lg border border-base-300 bg-base-100 p-4 space-y-2">
                <div class="flex items-center justify-between">
                  <code class="text-xs font-mono bg-base-200 px-1.5 py-0.5 rounded">
                    {shortId(event.session_id)}
                  </code>
                  <Show
                    when={event.open}
                    fallback={
                      <Badge class="bg-base-200 text-text-500 border-base-300 text-xs">
                        Fechado
                      </Badge>
                    }
                  >
                    <Badge class="bg-warning/15 text-warning border-warning/30 text-xs">
                      Aberto
                    </Badge>
                  </Show>
                </div>
                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span class="text-text-300">Motivo</span>
                    <p class="text-text-700">{event.reason}</p>
                  </div>
                  <div>
                    <span class="text-text-300">Duração</span>
                    <p class="font-mono text-text-700">
                      {formatDurationMs(event.clip_duration_ms)}
                      <Show when={event.open}>
                        <span class="text-warning ml-1">(parcial)</span>
                      </Show>
                    </p>
                  </div>
                  <div>
                    <span class="text-text-300">Início</span>
                    <p class="font-mono text-text-700">
                      {formatTime(event.clip_start_ms, props.timezone)}
                    </p>
                  </div>
                  <div>
                    <span class="text-text-300">Fim</span>
                    <p class="font-mono text-text-700">
                      <Show
                        when={!event.open}
                        fallback={
                          <span class="italic text-warning">em curso</span>
                        }
                      >
                        {formatTime(event.clip_end_ms, props.timezone)}
                      </Show>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}
