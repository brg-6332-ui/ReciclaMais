import { type Component, type JSX, splitProps } from 'solid-js'

import { cn } from '../../utils/cn'

type DivProps = JSX.HTMLAttributes<HTMLDivElement>
type HeadingProps = JSX.HTMLAttributes<HTMLHeadingElement>
type ParagraphProps = JSX.HTMLAttributes<HTMLParagraphElement>

export const Card: Component<DivProps> = (props) => {
  const [local, rest] = splitProps(props, ['class'])
  const classNameFromProps = (props as unknown as { className?: string })
    .className

  return (
    <div
      {...rest}
      class={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        local.class ?? classNameFromProps,
      )}
    />
  )
}

export const CardHeader: Component<DivProps> = (props) => {
  const [local, rest] = splitProps(props, ['class'])
  const classNameFromProps = (props as unknown as { className?: string })
    .className

  return (
    <div
      {...rest}
      class={cn(
        'flex flex-col space-y-1.5 p-6',
        local.class ?? classNameFromProps,
      )}
    />
  )
}

export const CardTitle: Component<HeadingProps> = (props) => {
  const [local, rest] = splitProps(props, ['class'])
  const classNameFromProps = (props as unknown as { className?: string })
    .className

  return (
    <h3
      {...rest}
      class={cn(
        'text-2xl font-semibold leading-none tracking-tight',
        local.class ?? classNameFromProps,
      )}
    />
  )
}

export const CardDescription: Component<ParagraphProps> = (props) => {
  const [local, rest] = splitProps(props, ['class'])
  const classNameFromProps = (props as unknown as { className?: string })
    .className

  return (
    <p
      {...rest}
      class={cn(
        'text-sm text-muted-foreground',
        local.class ?? classNameFromProps,
      )}
    />
  )
}

export const CardContent: Component<DivProps> = (props) => {
  const [local, rest] = splitProps(props, ['class'])
  const classNameFromProps = (props as unknown as { className?: string })
    .className

  return (
    <div {...rest} class={cn('p-6 pt-0', local.class ?? classNameFromProps)} />
  )
}

export const CardFooter: Component<DivProps> = (props) => {
  const [local, rest] = splitProps(props, ['class'])
  const classNameFromProps = (props as unknown as { className?: string })
    .className

  return (
    <div
      {...rest}
      class={cn(
        'flex items-center p-6 pt-0',
        local.class ?? classNameFromProps,
      )}
    />
  )
}
