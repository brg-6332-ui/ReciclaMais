import {
  type Accessor,
  createSignal,
  type JSX,
  type ParentProps,
} from 'solid-js'

import { cn } from '~/utils/cn'

/**
 * Value type for a segmented control option.
 */
export type AuthTabValue = 'login' | 'register'

/**
 * Context shape passed down via `AuthTabsProvider` (manual prop drilling).
 */
type AuthTabsApi = {
  /** Currently active tab */
  value: Accessor<AuthTabValue>
  /** Set the active tab */
  setValue: (v: AuthTabValue) => void
}

/* ------------------------------------------------------------------ */
/*  AuthTabs — segmented control root                                  */
/* ------------------------------------------------------------------ */

type AuthTabsRootProps = ParentProps<{
  /** Initial active tab (defaults to `'login'`). */
  defaultValue?: AuthTabValue
  /** Callback when the active tab changes. */
  onChange?: (value: AuthTabValue) => void
}>

/**
 * Segmented-control root that manages which tab is active.
 *
 * @example
 * ```tsx
 * <AuthTabsRoot>
 *   <AuthTabsTrigger value="login">Entrar</AuthTabsTrigger>
 *   <AuthTabsTrigger value="register">Registar</AuthTabsTrigger>
 * </AuthTabsRoot>
 * ```
 */
function AuthTabsRoot(props: AuthTabsRootProps) {
  const [value, setValue] = createSignal<AuthTabValue>(
    props.defaultValue ?? 'login',
  )

  const api: AuthTabsApi = {
    value,
    setValue: (v) => {
      setValue(v)
      props.onChange?.(v)
    },
  }

  return (
    <div
      role="tablist"
      aria-label="Modo de autenticação"
      class="relative flex w-full rounded-xl bg-base-200/60 p-1 backdrop-blur-sm dark:bg-base-300/40"
    >
      {/* Animated slider background */}
      <div
        class={cn(
          'absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-lg bg-primary-500/15 shadow-sm',
          'transition-transform duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
          'dark:bg-primary-400/20',
        )}
        style={{
          transform: value() === 'login' ? 'translateX(0)' : 'translateX(100%)',
        }}
      />

      {/* Render children, injecting the API */}
      {typeof props.children === 'function'
        ? (props.children as (api: AuthTabsApi) => JSX.Element)(api)
        : props.children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  AuthTabsTrigger — individual tab button                            */
/* ------------------------------------------------------------------ */

type AuthTabsTriggerProps = ParentProps<{
  /** Value that this trigger represents. */
  value: AuthTabValue
  /** API injected from root (manual prop drilling). */
  api: AuthTabsApi
}>

/**
 * Individual trigger button inside the segmented control.
 */
function AuthTabsTrigger(props: AuthTabsTriggerProps) {
  const active = () => props.api.value() === props.value

  return (
    <button
      role="tab"
      type="button"
      aria-selected={active()}
      data-state={active() ? 'active' : 'inactive'}
      class={cn(
        'relative z-10 flex-1 rounded-lg px-4 py-2 text-sm font-medium',
        'cursor-pointer select-none outline-none',
        'transition-all duration-200 ease-out',
        'focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100',
        active()
          ? 'text-primary-700 dark:text-primary-300'
          : 'text-base-content/60 hover:text-base-content/80 dark:text-base-content/50 dark:hover:text-base-content/70',
      )}
      onClick={() => props.api.setValue(props.value)}
    >
      {props.children}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Composed (convenience export)                                      */
/* ------------------------------------------------------------------ */

type AuthTabsProps = {
  /** Initial active tab (defaults to `'login'`). */
  defaultValue?: AuthTabValue
  /** Callback when the active tab changes. */
  onChange?: (value: AuthTabValue) => void
  /** Render prop that receives current value accessor. */
  children: (value: Accessor<AuthTabValue>) => JSX.Element
}

/**
 * Fully composed AuthTabs segmented control.
 *
 * @example
 * ```tsx
 * <AuthTabs defaultValue="login" onChange={clearErrors}>
 *   {(activeTab) => (
 *     <>
 *       <Show when={activeTab() === 'login'}>
 *         <LoginForm />
 *       </Show>
 *       <Show when={activeTab() === 'register'}>
 *         <RegisterForm />
 *       </Show>
 *     </>
 *   )}
 * </AuthTabs>
 * ```
 */
function AuthTabs(props: AuthTabsProps) {
  const [value, setValue] = createSignal<AuthTabValue>(
    props.defaultValue ?? 'login',
  )

  const api: AuthTabsApi = {
    value,
    setValue: (v) => {
      setValue(v)
      props.onChange?.(v)
    },
  }

  return (
    <div class="space-y-4">
      {/* Segmented control */}
      <div
        role="tablist"
        aria-label="Modo de autenticação"
        class="relative flex w-full rounded-xl bg-base-200/60 p-1 backdrop-blur-sm dark:bg-base-300/40"
      >
        {/* Animated slider */}
        <div
          class={cn(
            'absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-lg bg-primary-500/15 shadow-sm',
            'transition-transform duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
            'dark:bg-primary-400/20',
          )}
          style={{
            transform:
              value() === 'login' ? 'translateX(0)' : 'translateX(100%)',
          }}
        />

        <AuthTabsTrigger value="login" api={api}>
          Entrar
        </AuthTabsTrigger>
        <AuthTabsTrigger value="register" api={api}>
          Registar
        </AuthTabsTrigger>
      </div>

      {/* Content rendered via render-prop */}
      {props.children(value)}
    </div>
  )
}

export { AuthTabs, AuthTabsRoot, AuthTabsTrigger }
