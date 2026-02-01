import { ChevronDown, ChevronUp } from 'lucide-solid'
import { type JSX, splitProps } from 'solid-js'

import { cn } from '~/utils/cn'

type SelectProps = JSX.SelectHTMLAttributes<HTMLSelectElement>

/**
 * Lightweight Solid-friendly Select implementation.
 *
 * This file provides a small, accessible Select using a native <select> and
 * <option> under the hood. It exports the same names as the previous Radix
 * implementation so existing imports keep working, but the behaviour is
 * simplified and Solid-native.
 */

function Select(props: SelectProps) {
  const [local, others] = splitProps(props, ['class'])
  return (
    <select
      class={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        local.class,
      )}
      {...others}
    />
  )
}

function SelectTrigger(props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) {
  // For native <select> usage the trigger is the select itself. Keep a
  // lightweight trigger for compatibility — it renders a styled button but
  // does not control the native select. Use cases that require a custom
  // popover should replace this with a dedicated component.
  const [local, others] = splitProps(props, ['class', 'children'])
  return (
    <button
      type="button"
      class={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        local.class,
      )}
      {...others}
    >
      {local.children}
      <span aria-hidden>
        <ChevronDown class="h-4 w-4 opacity-50" />
      </span>
    </button>
  )
}

function SelectValue(props: { children?: JSX.Element }) {
  // No-op wrapper to keep API compatibility with Radix-based code that uses
  // <SelectValue>. It simply renders its children.
  return <span>{props.children}</span>
}

function SelectGroup(props: { children?: JSX.Element }) {
  return <optgroup>{props.children}</optgroup>
}

function SelectLabel(props: JSX.LabelHTMLAttributes<HTMLLabelElement>) {
  const [local, others] = splitProps(props, ['class', 'children'])
  return (
    <label
      class={cn('py-1.5 pl-2 pr-2 text-sm font-semibold', local.class)}
      {...others}
    >
      {local.children}
    </label>
  )
}

function SelectItem(props: JSX.OptionHTMLAttributes<HTMLOptionElement>) {
  const [local, others] = splitProps(props, ['class', 'children'])
  return (
    <option class={cn('text-sm', local.class)} {...others}>
      {local.children}
    </option>
  )
}

function SelectSeparator() {
  return <div class={cn('-mx-1 my-1 h-px bg-base-100')} />
}

function SelectScrollUpButton(
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>,
) {
  const [local, others] = splitProps(props, ['class'])
  return (
    <button
      class={cn(
        'flex cursor-default items-center justify-center py-1',
        local.class,
      )}
      {...others}
    >
      <ChevronUp class="h-4 w-4" />
    </button>
  )
}

function SelectScrollDownButton(
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>,
) {
  const [local, others] = splitProps(props, ['class'])
  return (
    <button
      class={cn(
        'flex cursor-default items-center justify-center py-1',
        local.class,
      )}
      {...others}
    >
      <ChevronDown class="h-4 w-4" />
    </button>
  )
}

export {
  Select,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
