import { Check, ChevronDown, Clipboard } from 'lucide-solid'
import { createSignal, Show } from 'solid-js'

const RAW_COLLAPSED_MAX = 3000

/**
 * Collapsible panel displaying the raw JSON payload with copy functionality.
 */
export default function RawPayloadPanel(props: { data: unknown }) {
  const [copied, setCopied] = createSignal(false)
  const [expanded, setExpanded] = createSignal(false)

  const jsonStr = () => JSON.stringify(props.data, null, 2)

  const displayStr = () => {
    const full = jsonStr()
    if (expanded() || full.length <= RAW_COLLAPSED_MAX) return full
    return full.slice(0, RAW_COLLAPSED_MAX)
  }

  const isTruncated = () => !expanded() && jsonStr().length > RAW_COLLAPSED_MAX

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonStr())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback — silently fail
    }
  }

  return (
    <details class="group rounded-lg border border-base-300 bg-base-100">
      <summary class="flex items-center gap-2 cursor-pointer p-4 text-sm font-medium text-text-700 select-none hover:bg-base-200/50 transition-colors">
        <ChevronDown class="w-4 h-4 text-text-300 transition-transform group-open:rotate-180 motion-reduce:transition-none" />
        Payload cru (JSON)
      </summary>
      <div class="px-4 pb-4 space-y-2">
        <div class="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void handleCopy()}
            class="inline-flex items-center gap-1.5 rounded-md border border-base-300 bg-base-100 px-2.5 py-1 text-xs text-text-500 hover:bg-base-200 transition-colors"
          >
            <Show when={copied()} fallback={<Clipboard class="w-3 h-3" />}>
              <Check class="w-3 h-3 text-success" />
            </Show>
            {copied() ? 'Copiado!' : 'Copiar'}
          </button>
          <span class="text-[10px] text-text-300">
            {(jsonStr().length / 1024).toFixed(1)} KB
          </span>
        </div>
        <pre class="overflow-x-auto rounded-md bg-base-200 p-3 text-xs font-mono text-text-500 max-h-[60vh] overflow-y-auto">
          {displayStr()}
        </pre>
        <Show when={isTruncated()}>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            class="text-xs text-primary-500 hover:text-primary-600 hover:underline"
          >
            Expandir payload completo ({(jsonStr().length / 1024).toFixed(1)}{' '}
            KB)
          </button>
        </Show>
      </div>
    </details>
  )
}
