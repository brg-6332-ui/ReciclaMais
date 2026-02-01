import { A, useLocation } from '@solidjs/router'
import { createEffect } from 'solid-js'

import { Button } from '~/components/ui/button'

const NotFound = () => {
  const location = useLocation()

  createEffect(() => {
    console.error(
      '404 Error: User attempted to access non-existent route:',
      location.pathname,
    )
  })

  return (
    <div class="flex min-h-screen items-center justify-center bg-linear-to-br from-primary-500/5 to-accent-500/5">
      <div class="text-center space-y-6 p-8">
        <h1 class="text-8xl font-bold bg-linear-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
          404
        </h1>
        <div class="space-y-2">
          <p class="text-2xl font-semibold">Página não encontrada</p>
          <p class="text-muted-foreground">
            A página que procura não existe ou foi movida.
          </p>
        </div>
        <A href="/">
          <Button size="lg" variant="hero">
            Voltar ao Início
          </Button>
        </A>
      </div>
    </div>
  )
}

export default NotFound
