import { Loader2, Trash2 } from 'lucide-solid'
import { createMemo, createSignal, For, Show, untrack } from 'solid-js'
import { toast } from 'solid-toast'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Select, SelectItem } from '~/components/ui/select'
import {
  createActivity,
  deleteActivity,
  updateActivity,
} from '~/modules/activity/application/activityApi'
import {
  type CreateActivityPayload,
  type EditableActivity,
  MATERIAL_TYPES,
  type MaterialType,
} from '~/modules/activity/domain/activity'
import { modalManager } from '~/modules/modal/core/modalManager'
import {
  openConfirmModal,
  openContentModal,
} from '~/modules/modal/helpers/modalHelpers'
import type { ModalId } from '~/modules/modal/types/modalTypes'

const MATERIAL_LABELS: Record<MaterialType, string> = {
  plastic: 'Plástico',
  glass: 'Vidro',
  paper: 'Papel',
  metal: 'Metal',
}

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

function formatQuantityFromGrams(grams: number): string {
  return (grams / 1000).toString().replace('.', ',')
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Falha ao processar a atividade. Tente novamente mais tarde.'
}

type ActivityModalProps =
  | {
      modalId: ModalId
      mode: 'create'
      onSuccess?: () => void
    }
  | {
      modalId: ModalId
      mode: 'edit'
      activity: EditableActivity
      onSuccess?: () => void
    }

function ActivityAddModal(props: ActivityModalProps) {
  const initialActivity = untrack(() =>
    props.mode === 'edit' ? props.activity : null,
  )

  const [material, setMaterial] = createSignal<MaterialType | ''>(
    initialActivity?.material ?? '',
  )
  const [quantityKg, setQuantityKg] = createSignal(
    initialActivity ? formatQuantityFromGrams(initialActivity.grams) : '',
  )
  const [rewardCents, setRewardCents] = createSignal(
    initialActivity ? Math.round(initialActivity.reward * 100) : 0,
  )
  const [occurredAt, setOccurredAt] = createSignal(
    initialActivity
      ? formatDateTimeLocal(new Date(initialActivity.occurred_at))
      : formatDateTimeLocal(new Date()),
  )
  const [notes, setNotes] = createSignal(initialActivity?.observation ?? '')
  const [error, setError] = createSignal<string | null>(null)
  const [isSubmitting, setIsSubmitting] = createSignal(false)
  const [isDeleting, setIsDeleting] = createSignal(false)

  const isEditMode = createMemo(() => props.mode === 'edit')
  const isBusy = createMemo(() => isSubmitting() || isDeleting())

  const quantityValue = createMemo(() => {
    return parseDecimalInput(quantityKg()) ?? 0
  })

  const isValidQuantity = createMemo(() => {
    const value = quantityValue()
    return value > 0 && value <= 50000
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
    void modalManager.closeModal(props.modalId)
  }

  async function handleSubmit(event: Event) {
    event.preventDefault()

    if (!isFormValid() || isBusy()) return

    const payload: CreateActivityPayload = {
      material: material() as MaterialType,
      grams: Math.round(quantityValue() * 1000),
      reward: Math.round(rewardValue() * 100) / 100,
      occurred_at: new Date(occurredAt()).toISOString(),
      observation: notes(),
    }

    try {
      setIsSubmitting(true)
      setError(null)

      if (isEditMode()) {
        await updateActivity(initialActivity!.id, payload)
        toast.success('Atividade atualizada com sucesso')
      } else {
        await createActivity(payload)
        toast.success('Atividade criada com sucesso')
      }

      props.onSuccess?.()
      await modalManager.closeModal(props.modalId)
    } catch (submissionError) {
      console.error('Error saving activity:', submissionError)
      setError(getErrorMessage(submissionError))
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleDeleteRequest() {
    if (!isEditMode() || isDeleting()) return

    openConfirmModal('Tem a certeza de que pretende remover esta atividade?', {
      title: 'Remover atividade',
      confirmText: 'Remover',
      cancelText: 'Cancelar',
      async onConfirm() {
        try {
          setIsDeleting(true)
          setError(null)
          await deleteActivity(initialActivity!.id)
          toast.success('Atividade removida com sucesso')
          props.onSuccess?.()
          await modalManager.closeModal(props.modalId)
        } catch (deleteError) {
          console.error('Error deleting activity:', deleteError)
          setError(getErrorMessage(deleteError))
          toast.error(
            'Falha ao remover a atividade. Tente novamente mais tarde.',
          )
        } finally {
          setIsDeleting(false)
        }
      },
    })
  }

  return (
    <form class="space-y-6 p-4" onSubmit={(event) => void handleSubmit(event)}>
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

      <Show when={error()}>
        <div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error()}
        </div>
      </Show>

      <div class="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Show when={isEditMode()}>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDeleteRequest}
            disabled={isBusy()}
          >
            <Show
              when={isDeleting()}
              fallback={
                <>
                  <Trash2 />
                  Excluir
                </>
              }
            >
              <Loader2 class="animate-spin" />A remover...
            </Show>
          </Button>
        </Show>

        <div class="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isBusy()}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="hero"
            disabled={!isFormValid() || isBusy()}
          >
            <Show
              when={isSubmitting()}
              fallback={
                isEditMode() ? 'Guardar Alterações' : 'Confirmar Reciclagem'
              }
            >
              <Loader2 class="animate-spin" />A enviar...
            </Show>
          </Button>
        </div>
      </div>
    </form>
  )
}

export function openActivityAddModal(options?: {
  onSuccess?: () => void
}): void {
  openContentModal(
    (modalId) => (
      <ActivityAddModal
        modalId={modalId}
        mode="create"
        onSuccess={options?.onSuccess}
      />
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

export function openActivityEditModal(
  activity: EditableActivity,
  options?: {
    onSuccess?: () => void
  },
): void {
  openContentModal(
    (modalId) => (
      <ActivityAddModal
        modalId={modalId}
        mode="edit"
        activity={activity}
        onSuccess={options?.onSuccess}
      />
    ),
    {
      title: 'Editar Atividade',
      priority: 'high',
      closeOnEscape: true,
      closeOnOutsideClick: false,
      showCloseButton: true,
    },
  )
}
