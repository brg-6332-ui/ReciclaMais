import { type JSX, splitProps } from 'solid-js'

import { cn } from '~/utils/cn'

type DivProps = JSX.HTMLAttributes<HTMLDivElement>

function Avatar(props: DivProps) {
  const [local, others] = splitProps(props, ['class'])
  return (
    <div
      class={cn(
        'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
        local.class,
      )}
      {...others}
    />
  )
}

type ImgProps = JSX.ImgHTMLAttributes<HTMLImageElement>

function AvatarImage(props: ImgProps) {
  const [local, others] = splitProps(props, ['class'])
  return (
    <img class={cn('aspect-square h-full w-full', local.class)} {...others} />
  )
}

function AvatarFallback(props: DivProps) {
  const [local, others] = splitProps(props, ['class'])
  return (
    <div
      class={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-base-100',
        local.class,
      )}
      {...others}
    />
  )
}

export { Avatar, AvatarFallback, AvatarImage }
