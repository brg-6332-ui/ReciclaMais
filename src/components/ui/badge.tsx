import { cva, type VariantProps } from 'class-variance-authority'
import { type JSX, splitProps } from 'solid-js'

import { cn } from '~/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary-500 text-primary-950 hover:bg-primary-600',
        secondary:
          'border-transparent bg-secondary-500 text-secondary-950 hover:bg-secondary-600',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends JSX.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge(props: BadgeProps) {
  const [local, others] = splitProps(props, ['class', 'variant'])
  return (
    <div
      class={cn(badgeVariants({ variant: local.variant }), local.class)}
      {...others}
    />
  )
}

export { Badge, badgeVariants }
