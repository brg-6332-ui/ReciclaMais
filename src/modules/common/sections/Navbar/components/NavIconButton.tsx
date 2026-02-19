import { A, useLocation } from '@solidjs/router'
import type { Component, ComponentProps } from 'solid-js'

interface NavIconButtonProps {
  href: string
  title: string
  icon: Component<ComponentProps<'svg'>>
  isActive: boolean
}

/**
 * Icon button for navigation items
 */
export function NavIconButton(props: NavIconButtonProps) {
  return (
    <A
      href={props.href}
      title={props.title}
      aria-current={props.isActive ? 'page' : undefined}
      class={`flex-1 text-center justify-items-center rounded-lg p-2 px-3 transition duration-150 ease-in-out transform ${
        props.isActive
          ? 'bg-primary-300'
          : 'bg-transparent hover:bg-primary-200/30 hover:scale-105 active:scale-95'
      }`}
    >
      <props.icon class="h-4 w-4" />
    </A>
  )
}

interface DashboardIconButtonProps {
  isActive: boolean
}

/**
 * Dashboard icon button component
 */
export function DashboardIconButton(props: DashboardIconButtonProps) {
  return (
    <A
      href="/dashboard"
      title="Painel"
      aria-current={props.isActive ? 'page' : undefined}
      class={`rounded-lg p-2 px-3 transition duration-150 ease-in-out transform ${
        props.isActive
          ? 'bg-primary-300'
          : 'bg-transparent hover:bg-primary-200/30 hover:scale-105 active:scale-95'
      }`}
    >
      <svg
        class="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="3"
          y="3"
          width="8"
          height="8"
          stroke="currentColor"
          stroke-width="1.5"
          rx="1"
        />
        <rect
          x="13"
          y="3"
          width="8"
          height="8"
          stroke="currentColor"
          stroke-width="1.5"
          rx="1"
        />
        <rect
          x="3"
          y="13"
          width="8"
          height="8"
          stroke="currentColor"
          stroke-width="1.5"
          rx="1"
        />
        <rect
          x="13"
          y="13"
          width="8"
          height="8"
          stroke="currentColor"
          stroke-width="1.5"
          rx="1"
        />
      </svg>
    </A>
  )
}

interface MobileNavLinkProps {
  href: string
  icon: Component<ComponentProps<'svg'>>
  label: string
  onClick: () => void
}

/**
 * Mobile navigation link component
 */
export function MobileNavLink(props: MobileNavLinkProps) {
  const location = useLocation()
  const isActive = () => location.pathname === props.href

  return (
    <A
      href={props.href}
      onClick={props.onClick}
      class={`flex items-center gap-3 px-3 py-2 rounded-md text-base-content hover:bg-base-200 active:scale-95 active:opacity-90 transition-transform duration-150 ${
        isActive() ? 'bg-base-200' : ''
      }`}
    >
      <props.icon class="h-5 w-5" />
      <span>{props.label}</span>
    </A>
  )
}
