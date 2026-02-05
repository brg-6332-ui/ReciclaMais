import { createMemo, createSignal, For, Show } from 'solid-js'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Select, SelectItem } from '~/components/ui/select'
import { useAddActivity } from '~/modules/activity/application/useAddActivity'
import {
  type CreateActivityPayload,
  MATERIAL_TYPES,
  type MaterialType,
  REWARD_RATES,
} from '~/modules/activity/domain/activity'
import { modalManager } from '~/modules/modal/core/modalManager'
import { openContentModal } from '~/modules/modal/helpers/modalHelpers'
import type { ModalId } from '~/modules/modal/types/modalTypes'

/**
 * Material type labels in Portuguese.
 */
const MATERIAL_LABELS: Record<MaterialType, string> = {
  plastic: 'Plástico',
  glass: 'Vidro',
  paper: 'Papel',
  metal: 'Metal',
}

/**
 * Formats a Date to datetime-local input format.
 */
function formatDateTimeLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

/**
 * Calculates estimated reward based on material and quantity.
 */
function calculateEstimatedReward(
  material: MaterialType | '',
  quantityKg: number,
): number {
  if (!material || quantityKg <= 0) return 0
  const rate = REWARD_RATES[material]
  const grams = Math.round(quantityKg * 1000)
  return Math.round(grams * rate * 100) / 100
}

interface ActivityAddModalProps {
  modalId: ModalId
  onSuccess?: () => void
}

function ActivityAddModal(props: ActivityAddModalProps) {
  const { execute, state, error, reset } = useAddActivity()

  // Form state
  const [material, setMaterial] = createSignal<MaterialType | ''>('')
  const [quantityKg, setQuantityKg] = createSignal<string>('')
  const [occurredAt, setOccurredAt] = createSignal(
    formatDateTimeLocal(new Date()),
  )
  const [notes, setNotes] = createSignal('')

  // Validation
  const quantityValue = createMemo(() => {
    const val = parseFloat(quantityKg())
    return isNaN(val) ? 0 : val
  })

  const isValidQuantity = createMemo(() => {
    const val = quantityValue()
    return val > 0 && val <= 50000
  })

  const isValidDate = createMemo(() => {
    const date = new Date(occurredAt())
    const now = new Date()
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000)
    return date <= fiveMinutesFromNow
  })

  const isFormValid = createMemo(() => {
    return material() !== '' && isValidQuantity() && isValidDate()
  })

  // Estimated reward
  const estimatedReward = createMemo(() =>
    calculateEstimatedReward(material(), quantityValue()),
  )

  // Handlers
  function handleMaterialChange(event: Event) {
    const target = event.target as HTMLSelectElement
    setMaterial(target.value as MaterialType | '')
  }

  function handleQuantityChange(event: Event) {
    const target = event.target as HTMLInputElement
    setQuantityKg(target.value)
  }

  function handleDateChange(event: Event) {
    const target = event.target as HTMLInputElement
    setOccurredAt(target.value)
  }

  function handleNotesChange(event: Event) {
    const target = event.target as HTMLTextAreaElement
    setNotes(target.value)
  }

  function handleCancel() {
    reset()
    void modalManager.closeModal(props.modalId)
  }

  async function handleSubmit(event: Event) {
    event.preventDefault()

    if (!isFormValid()) return

    const grams = Math.round(quantityValue() * 1000)
    const occurredAtDate = new Date(occurredAt())

    const payload: CreateActivityPayload = {
      material: material() as MaterialType,
      grams,
      occurred_at: occurredAtDate.toISOString(),
    }

    const result = await execute(payload)

    if (result) {
      props.onSuccess?.()
      void modalManager.closeModal(props.modalId)
    }
  }

  return (
    <form class="space-y-6 p-4" onSubmit={(e) => void handleSubmit(e)}>
      {/* Material Select */}
      <div class="space-y-2">
        <Label for="material">Tipo de Material *</Label>
        <Select
          id="material"
          value={material()}
          onChange={handleMaterialChange}
          required
        >
          <SelectItem value="" disabled>
            Selecione um material
          </SelectItem>
          <For each={MATERIAL_TYPES}>
            {(type) => (
              <SelectItem value={type}>{MATERIAL_LABELS[type]}</SelectItem>
            )}
          </For>
        </Select>
      </div>

      {/* Quantity Input */}
      <div class="space-y-2">
        <Label for="quantity">Quantidade (kg) *</Label>
        <Input
          id="quantity"
          type="number"
          step="0.01"
          min="0.01"
          max="50000"
          placeholder="Ex: 2.5"
          value={quantityKg()}
          onInput={handleQuantityChange}
          required
        />
        <Show when={quantityKg() !== '' && !isValidQuantity()}>
          <p class="text-sm text-destructive">
            Quantidade deve ser entre 0.01 e 50000 kg
          </p>
        </Show>
      </div>

      {/* Date/Time Input */}
      <div class="space-y-2">
        <Label for="occurred-at">Data e Hora *</Label>
        <Input
          id="occurred-at"
          type="datetime-local"
          value={occurredAt()}
          onInput={handleDateChange}
          max={formatDateTimeLocal(new Date())}
          required
        />
        <Show when={!isValidDate()}>
          <p class="text-sm text-destructive">Data não pode ser no futuro</p>
        </Show>
      </div>

      {/* Estimated Reward */}
      <div class="space-y-2">
        <Label>Recompensa Estimada</Label>
        <div class="h-10 flex items-center px-3 rounded-md border border-input bg-muted/50">
          <span class="text-lg font-semibold text-accent-500">
            {estimatedReward().toFixed(2)}€
          </span>
        </div>
        <p class="text-xs text-muted-foreground">
          Valor estimado. A recompensa final é calculada pelo sistema.
        </p>
      </div>

      {/* Notes */}
      <div class="space-y-2">
        <Label for="notes">Observações (opcional)</Label>
        <textarea
          id="notes"
          class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Adicione notas sobre esta reciclagem..."
          value={notes()}
          onInput={handleNotesChange}
        />
      </div>

      {/* Error Message */}
      <Show when={state() === 'error' && error()}>
        <div class="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
          {error()?.message}
        </div>
      </Show>

      {/* Actions */}
      <div class="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={state() === 'submitting'}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="hero"
          disabled={!isFormValid() || state() === 'submitting'}
        >
          <Show when={state() === 'submitting'} fallback="Confirmar Reciclagem">
            A enviar...
          </Show>
        </Button>
      </div>
    </form>
  )
}

/**
 * Opens the activity add modal.
 * @param options - Optional callbacks
 */
export function openActivityAddModal(options?: {
  onSuccess?: () => void
}): void {
  openContentModal(
    (modalId) => (
      <ActivityAddModal modalId={modalId} onSuccess={options?.onSuccess} />
    ),
    {
      title: 'Nova Reciclagem',
      priority: 'high',
      closeOnEscape: true,
      closeOnOutsideClick: false,
      showCloseButton: true,
    },
  )
}
