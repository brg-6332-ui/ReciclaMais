import { cva, type VariantProps } from 'class-variance-authority'
import { type JSX, splitProps } from 'solid-js'

import { cn } from '~/utils/cn'

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
)

export interface LabelProps
  extends JSX.LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {}

function Label(props: LabelProps) {
  const [local, others] = splitProps(props, ['class'])
  return <label class={cn(labelVariants(), local.class)} {...others} />
}

export { Label }
