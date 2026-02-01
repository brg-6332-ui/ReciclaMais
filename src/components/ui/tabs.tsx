import {
  createContext,
  createSignal,
  type JSX,
  ParentProps,
  splitProps,
  useContext,
} from 'solid-js'

import { cn } from '~/utils/cn'

type TabsContextValue = {
  value: () => string
  setValue: (v: string) => void
}

const TabsContext = createContext<TabsContextValue>()

function Tabs(props: ParentProps<{ defaultValue?: string }>) {
  const [local, others] = splitProps(props, ['defaultValue', 'children'])
  const [value, setValue] = createSignal(local.defaultValue ?? '')

  return (
    <TabsContext.Provider value={{ value, setValue }} {...others}>
      {local.children}
    </TabsContext.Provider>
  )
}

function TabsList(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const [local, others] = splitProps(props, ['class', 'children'])
  return (
    <div
      class={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-base-100 p-1 text-muted-foreground',
        local.class,
      )}
      {...others}
    >
      {local.children}
    </div>
  )
}

function TabsTrigger(
  props: ParentProps<
    { value: string } & JSX.ButtonHTMLAttributes<HTMLButtonElement>
  >,
) {
  const ctx = useContext(TabsContext)
  const [local, others] = splitProps(props, ['class', 'value', 'children'])
  const active = () => ctx?.value() === local.value
  return (
    <button
      class={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        local.class,
      )}
      aria-selected={active()}
      data-state={active() ? 'active' : 'inactive'}
      onClick={() => ctx?.setValue(local.value)}
      {...others}
    >
      {local.children}
    </button>
  )
}

function TabsContent(
  props: ParentProps<{ value: string } & JSX.HTMLAttributes<HTMLDivElement>>,
) {
  const ctx = useContext(TabsContext)
  const [local, others] = splitProps(props, ['class', 'value', 'children'])
  return (
    <div
      class={cn(
        'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        local.class,
      )}
      hidden={ctx?.value() !== local.value}
      {...others}
    >
      {local.children}
    </div>
  )
}

export { Tabs, TabsContent, TabsList, TabsTrigger }
