import { A } from '@solidjs/router'
import { Recycle } from 'lucide-solid'
import { createSignal, onMount } from 'solid-js'
import { toast } from 'solid-toast'

import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { authActions } from '~/modules/auth/application/authActions'

const Auth = () => {
  const [isLoading, setIsLoading] = createSignal(false)

  const handleLogin = (e: Event) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate login
    setTimeout(() => {
      setIsLoading(false)
      toast.success('Login realizado com sucesso!')
    }, 1500)
  }

  const handleRegister = (e: Event) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate registration
    setTimeout(() => {
      setIsLoading(false)
      toast.success('Conta criada com sucesso! Bem-vindo!')
    }, 1500)
  }

  onMount(() => {
    void authActions.loginWithGoogle().catch((error) => {
      toast.error(
        `Erro ao autenticar com Google: ${error instanceof Error ? error.message : String(error)}`,
      )
    })
  })

  return (
    <div class="min-h-screen flex items-center justify-center py-12 px-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <A href="/" class="inline-flex items-center gap-2 mb-4">
            <div class="h-12 w-12 rounded-full bg-linear-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
              <Recycle class="h-7 w-7 text-primary-950" />
            </div>
            <span class="font-bold text-2xl bg-linear-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
              EcoRewards
            </span>
          </A>
          <h1 class="text-3xl font-bold">Bem-vindo</h1>
          <p class="text-muted-foreground mt-2">
            Entre ou crie uma conta para começar
          </p>
        </div>

        <div class="w-full">
          <Tabs defaultValue="login">
            <TabsList class="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Registar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card class="shadow-lg">
                <CardHeader>
                  <CardTitle>Entrar na Conta</CardTitle>
                  <CardDescription>
                    Entre com o seu email e password
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} class="space-y-4">
                    <div class="space-y-2">
                      <Label for="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                    <div class="space-y-2">
                      <Label for="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <Button type="submit" class="w-full" disabled={isLoading()}>
                      {isLoading() ? 'A entrar...' : 'Entrar'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card class="shadow-lg">
                <CardHeader>
                  <CardTitle>Criar Conta</CardTitle>
                  <CardDescription>
                    Preencha os dados para criar a sua conta
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} class="space-y-4">
                    <div class="space-y-2">
                      <Label for="register-name">Nome Completo</Label>
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="João Silva"
                        required
                      />
                    </div>
                    <div class="space-y-2">
                      <Label for="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                    <div class="space-y-2">
                      <Label for="register-password">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <div class="space-y-2">
                      <Label for="register-confirm">Confirmar Password</Label>
                      <Input
                        id="register-confirm"
                        type="password"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <Button type="submit" class="w-full" disabled={isLoading()}>
                      {isLoading() ? 'A criar conta...' : 'Criar Conta'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <p class="text-center text-sm text-muted-foreground mt-6">
          Ao continuar, concorda com os nossos{' '}
          <A href="/terms" class="text-primary-500 hover:underline">
            Termos de Uso
          </A>{' '}
          e{' '}
          <A href="/privacy" class="text-primary-500 hover:underline">
            Política de Privacidade
          </A>
        </p>
      </div>
    </div>
  )
}

export default Auth
