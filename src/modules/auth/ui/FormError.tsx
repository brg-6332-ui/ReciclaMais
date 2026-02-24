import { AlertCircle } from 'lucide-solid'
import { Show } from 'solid-js'

import { cn } from '~/utils/cn'

/**
 * Props for the `FormError` component.
 */
export type FormErrorProps = {
  /** Error message to display. When falsy, the component renders nothing. */
  message: string | undefined
  /** Additional CSS classes. */
  class?: string
}

/**
 * Contextual error banner for auth forms.
 *
 * Renders a non-aggressive error message with a subtle icon, using the
 * project's error palette and a gentle fade + slide-down entrance.
 *
 * @example
 * ```tsx
 * <FormError message={errorMessage()} />
 * ```
 */
export function FormError(props: FormErrorProps) {
  return (
    <Show when={props.message}>
      {(msg) => (
        <div
          role="alert"
          class={cn(
            'flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm',
            'border-error/20 bg-error/5 text-error',
            'dark:border-error/25 dark:bg-error/10 dark:text-error',
            'animate-[formErrorIn_250ms_ease-out_both]',
            props.class,
          )}
        >
          <AlertCircle class="mt-0.5 h-4 w-4 shrink-0" />
          <span>{msg()}</span>
        </div>
      )}
    </Show>
  )
}

/**
 * Props for inline field-level error hint.
 */
export type FieldErrorProps = {
  /** Error text. When falsy, nothing is rendered. */
  message: string | undefined
}

/**
 * Small inline error hint shown directly below a form field.
 *
 * @example
 * ```tsx
 * <Input id="email" ... />
 * <FieldError message={emailError()} />
 * ```
 */
export function FieldError(props: FieldErrorProps) {
  return (
    <Show when={props.message}>
      {(msg) => (
        <p class="mt-1 text-xs text-error animate-[formErrorIn_200ms_ease-out_both]">
          {msg()}
        </p>
      )}
    </Show>
  )
}
