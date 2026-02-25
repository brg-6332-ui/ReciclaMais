import { For, Show } from 'solid-js'

import { Badge } from '~/components/ui/badge'
import {
  formatDurationMs,
  formatLatLng,
  shortId,
  timeAgo,
} from '~/modules/test-gps/formatters'
import type { GpsEntry } from '~/modules/test-gps/types'

/**
 * Table displaying active GPS sessions with key quality metrics.
 * Renders as a responsive table on desktop and stacked cards on mobile.
 */
export default function SessionsTable(props: { entries: GpsEntry[] }) {
  return (
    <div class="w-full">
      {/* Desktop table */}
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-base-300 text-left text-text-500">
              <th class="pb-3 pr-4 font-medium">ID</th>
              <th class="pb-3 pr-4 font-medium">Última atividade</th>
              <th class="pb-3 pr-4 font-medium">Última posição válida</th>
              <th class="pb-3 pr-4 font-medium">TTFF</th>
              <th class="pb-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            <For each={props.entries}>
              {(entry) => (
                <tr class="border-b border-base-200 hover:bg-base-200/50 transition-colors">
                  <td class="py-3 pr-4">
                    <code class="text-xs font-mono bg-base-200 px-1.5 py-0.5 rounded">
                      {shortId(entry.id)}
                    </code>
                  </td>
                  <td class="py-3 pr-4 text-text-500">
                    {timeAgo(entry.lastSeen)}
                  </td>
                  <td class="py-3 pr-4 text-text-500">
                    <Show
                      when={entry.lat !== null && entry.lng !== null}
                      fallback={
                        <span class="text-text-300 italic">Sem fix</span>
                      }
                    >
                      <span class="font-mono text-xs text-text-700">
                        {formatLatLng(entry.lat, entry.lng)}
                      </span>
                    </Show>
                  </td>
                  <td class="py-3 pr-4 font-mono text-xs">
                    {formatDurationMs(entry.quality.ttff_ms)}
                  </td>
                  <td class="py-3">
                    <Show
                      when={entry.quality.open_outage}
                      fallback={
                        <Badge class="bg-success/15 text-success border-success/30 text-xs">
                          Ativo
                        </Badge>
                      }
                    >
                      <Badge class="bg-error/15 text-error border-error/30 text-xs">
                        Outage{' '}
                        <Show when={entry.quality.open_outage_reason}>
                          ({entry.quality.open_outage_reason})
                        </Show>
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
        <For each={props.entries}>
          {(entry) => (
            <div class="rounded-lg border border-base-300 bg-base-100 p-4 space-y-2">
              <div class="flex items-center justify-between">
                <code class="text-xs font-mono bg-base-200 px-1.5 py-0.5 rounded">
                  {shortId(entry.id)}
                </code>
                <Show
                  when={entry.quality.open_outage}
                  fallback={
                    <Badge class="bg-success/15 text-success border-success/30 text-xs">
                      Ativo
                    </Badge>
                  }
                >
                  <Badge class="bg-error/15 text-error border-error/30 text-xs">
                    Outage
                  </Badge>
                </Show>
              </div>
              <div class="grid grid-cols-2 gap-2 text-xs text-text-500">
                <div>
                  <span class="text-text-300">Última atividade</span>
                  <p class="text-text-700">{timeAgo(entry.lastSeen)}</p>
                </div>
                <div>
                  <span class="text-text-300">Última posição</span>
                  <p class="font-mono text-text-700">
                    <Show
                      when={entry.lat !== null && entry.lng !== null}
                      fallback={
                        <span class="italic text-text-300">Sem fix</span>
                      }
                    >
                      {formatLatLng(entry.lat, entry.lng)}
                    </Show>
                  </p>
                </div>
                <div>
                  <span class="text-text-300">TTFF</span>
                  <p class="font-mono text-text-700">
                    {formatDurationMs(entry.quality.ttff_ms)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </For>
      </div>

      {/* Empty state */}
      <Show when={props.entries.length === 0}>
        <div class="text-center py-8 text-text-300">
          <p>Sem sessões ativas no momento.</p>
        </div>
      </Show>
    </div>
  )
}
