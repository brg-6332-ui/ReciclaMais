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

const DECIMAL_INPUT_PATTERN = /^\d*(?:[,.]\d*)?$/

function parseDecimalInput(value: string): number | null {
  const normalized = value.trim().replace(',', '.')

  if (normalized === '' || normalized === '.') {
    return null
  }

  const parsedValue = Number.parseFloat(normalized)
  return Number.isNaN(parsedValue) ? null : parsedValue
}

function getNextDecimalInputValue(value: string): string | null {
  const sanitizedValue = value.replace(/\s+/g, '')
  return DECIMAL_INPUT_PATTERN.test(sanitizedValue) ? sanitizedValue : null
}

function formatEuroCents(cents: number): string {
  const normalizedCents = Math.max(0, Math.trunc(cents))
  return `EUR ${(normalizedCents / 100).toFixed(2).replace('.', ',')}`
}

function getCurrencyCentsFromInput(value: string): number {
  const digitsOnly = value.replace(/\D+/g, '')

  if (digitsOnly === '') {
    return 0
  }

  return Number.parseInt(digitsOnly, 10)
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
  const [rewardCents, setRewardCents] = createSignal(0)
  const [occurredAt, setOccurredAt] = createSignal(
    formatDateTimeLocal(new Date()),
  )
  const [notes, setNotes] = createSignal('')

  // Validation
  const quantityValue = createMemo(() => {
    return parseDecimalInput(quantityKg()) ?? 0
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

  const rewardValue = createMemo(() => {
    return rewardCents() / 100
  })

  const isFormValid = createMemo(() => {
    return material() !== '' && isValidQuantity() && isValidDate()
  })

  // Handlers
  function handleMaterialChange(event: Event) {
    const target = event.target as HTMLSelectElement
    setMaterial(target.value as MaterialType | '')
  }

  function handleQuantityChange(event: Event) {
    const target = event.target as HTMLInputElement
    const nextValue = getNextDecimalInputValue(target.value)

    if (nextValue !== null) {
      setQuantityKg(nextValue)
    }
  }

  function handleDateChange(event: Event) {
    const target = event.target as HTMLInputElement
    setOccurredAt(target.value)
  }

  function handleRewardChange(event: Event) {
    const target = event.target as HTMLInputElement
    const nextRewardCents = getCurrencyCentsFromInput(target.value)
    const formattedValue = formatEuroCents(nextRewardCents)

    if (target.value !== formattedValue) {
      target.value = formattedValue
    }

    setRewardCents(nextRewardCents)
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
      reward: Math.round(rewardValue() * 100) / 100,
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
          type="text"
          inputMode="decimal"
          placeholder="Ex: 2,5"
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

      {/* Reward Input */}
      <div class="space-y-2">
        <Label for="reward">Recompensa (€) *</Label>
        <Input
          id="reward"
          type="text"
          inputMode="numeric"
          value={formatEuroCents(rewardCents())}
          onInput={handleRewardChange}
          required
        />
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
