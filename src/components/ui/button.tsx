import { cva, type VariantProps } from 'class-variance-authority'
import { type Component, type JSX, splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'

import { cn } from '../../utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary-500 text-primary-500 hover:bg-primary-600',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-input bg-background hover:bg-accent-500 hover:text-accent-950',
        secondary: 'bg-secondary-500 text-secondary-500 hover:bg-secondary-600',
        ghost: 'hover:bg-accent-500 hover:text-accent-950',
        link: 'text-primary-500 underline-offset-4 hover:underline',
        hero: 'bg-gradient-to-r from-primary-500 to-accent-500 text-primary-950 hover:shadow-lg hover:scale-105 transition-all duration-300',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends JSX.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** If provided, renders this component/tag instead of a native `button` */
  as?: string | Component<Record<string, unknown>>
}

export function Button(props: ButtonProps) {
  const [local, rest] = splitProps(props, ['as', 'class', 'variant', 'size'])
  const classNameFromProps = (props as unknown as { className?: string })
    .className

  return (
    <Dynamic
      component={local.as ?? 'button'}
      class={cn(
        buttonVariants({
          variant: local.variant,
          size: local.size,
          className: local.class ?? classNameFromProps,
        }),
      )}
      {...rest}
    />
  )
}

export { buttonVariants }
