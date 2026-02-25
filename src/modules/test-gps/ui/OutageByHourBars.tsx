import { createMemo, For, Show } from 'solid-js'

import { generateHourLabels } from '~/modules/test-gps/formatters'

/**
 * Horizontal bar chart showing outage counts by hour of day (hora de início).
 * Purely CSS-based — no external chart libraries.
 */
export default function OutageByHourBars(props: {
  byHour: Record<string, number>
}) {
  const hours = generateHourLabels()

  const maxValue = createMemo(() => {
    const values = Object.values(props.byHour)
    return values.length > 0 ? Math.max(...values) : 0
  })

  const total = createMemo(() =>
    Object.values(props.byHour).reduce((sum, v) => sum + v, 0),
  )

  return (
    <div class="w-full space-y-1">
      <div class="flex items-center justify-between mb-3">
        <p class="text-xs text-text-300">Outages por hora (hora de início)</p>
        <Show when={total() > 0}>
          <span class="text-xs font-mono text-text-500">Total: {total()}</span>
        </Show>
      </div>

      <Show
        when={total() > 0}
        fallback={
          <div class="text-center py-8 text-text-300 text-sm">
            <p>Sem outages registados nesta janela.</p>
          </div>
        }
      >
        <div class="space-y-0.5">
          <For each={hours}>
            {(hour) => {
              const count = () => props.byHour[hour] ?? 0
              const pct = () =>
                maxValue() > 0 ? Math.round((count() / maxValue()) * 100) : 0

              return (
                <div
                  class="group flex items-center gap-2 py-0.5"
                  title={`${hour}h — ${count()} outage(s)`}
                >
                  <span class="text-[10px] font-mono text-text-300 w-5 text-right shrink-0">
                    {hour}
                  </span>
                  <div class="flex-1 h-4 bg-base-200 rounded-sm overflow-hidden relative">
                    <div
                      class="h-full rounded-sm transition-all duration-300 motion-reduce:transition-none"
                      classList={{
                        'bg-error/70': count() > 0,
                        'bg-transparent': count() === 0,
                      }}
                      style={{ width: `${pct()}%` }}
                    />
                    <Show when={count() > 0}>
                      <span class="absolute inset-y-0 right-1 flex items-center text-[10px] font-mono text-text-500 opacity-0 group-hover:opacity-100 transition-opacity motion-reduce:transition-none">
                        {count()}
                      </span>
                    </Show>
                  </div>
                </div>
              )
            }}
          </For>
        </div>
      </Show>
    </div>
  )
}
