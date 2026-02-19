import { BookOpenIcon, InfoIcon, MapPinIcon, RecycleIcon } from 'lucide-solid'
import type { Component, ComponentProps } from 'solid-js'

/**
 * Navigation item type definition
 */
export interface NavItem {
  path: string
  title: string
  icon: Component<ComponentProps<'svg'>>
  label: string
}

/**
 * Main navigation items shown in the navbar
 */
export const NAV_ITEMS: NavItem[] = [
  {
    path: '/',
    title: 'Início',
    icon: RecycleIcon,
    label: 'Início',
  },
  {
    path: '/collection-points',
    title: 'Pontos de Recolha',
    icon: MapPinIcon,
    label: 'Pontos de Recolha',
  },
  {
    path: '/guide',
    title: 'Guia de Reciclagem',
    icon: BookOpenIcon,
    label: 'Guia de Reciclagem',
  },
  {
    path: '/about',
    title: 'Sobre',
    icon: InfoIcon,
    label: 'Sobre',
  },
]

/**
 * Dashboard icon path configuration
 */
export const DASHBOARD_ICON_PATH = {
  viewBox: '0 0 24 24',
  rects: [
    { x: 3, y: 3, width: 8, height: 8 },
    { x: 13, y: 3, width: 8, height: 8 },
    { x: 3, y: 13, width: 8, height: 8 },
    { x: 13, y: 13, width: 8, height: 8 },
  ],
}

/**
 * User icon path configuration
 */
export const USER_ICON_PATH = {
  viewBox: '0 0 24 24',
  paths: [
    {
      d: 'M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z',
      stroke: '#9CA3AF',
      strokeWidth: '1.5',
    },
    {
      d: 'M20 21v-1c0-2.761-4.03-5-8-5s-8 2.239-8 5v1',
      stroke: '#9CA3AF',
      strokeWidth: '1.5',
    },
  ],
}

/**
 * Hamburger menu icon path
 */
export const HAMBURGER_ICON_PATH = 'M4 6h16M4 12h16M4 18h16'

/**
 * Close icon path
 */
export const CLOSE_ICON_PATH = 'M6 18L18 6M6 6l12 12'

/**
 * Media query breakpoint for compact search
 */
export const COMPACT_SEARCH_BREAKPOINT = '(max-width: 442px)'
