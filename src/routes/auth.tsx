import { A } from '@solidjs/router'
import { Recycle } from 'lucide-solid'
import { createSignal } from 'solid-js'
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
import { authActions } from '~/features/identity-access/application/authActions'

const Auth = () => {
  const [isLoading, setIsLoading] = createSignal(false)
  const [loginEmail, setLoginEmail] = createSignal('')
  const [loginPassword, setLoginPassword] = createSignal('')

  const [registerName, setRegisterName] = createSignal('')
  const [registerEmail, setRegisterEmail] = createSignal('')
  const [registerPassword, setRegisterPassword] = createSignal('')
  const [registerConfirm, setRegisterConfirm] = createSignal('')

  const handleLogin = async (e: Event) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await authActions.signInWithEmail(loginEmail(), loginPassword())
      toast.success('Sessão iniciada com sucesso!')
      window.location.href = '/' // redirect to home on success
    } catch (err) {
      toast.error(
        `Erro ao autenticar: ${err instanceof Error ? err.message : String(err)}`,
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: Event) => {
    e.preventDefault()
    if (registerPassword() !== registerConfirm()) {
      toast.error('As palavras-passe não coincidem')
      return
    }
    setIsLoading(true)
    try {
      await authActions.signUpWithEmail(registerEmail(), registerPassword())
      toast.success(
        'Conta criada com sucesso! Verifique o seu email para confirmar.',
      )
      window.location.href = '/' // optionally redirect
    } catch (err) {
      toast.error(
        `Erro ao registar: ${err instanceof Error ? err.message : String(err)}`,
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogle = async () => {
    setIsLoading(true)
    try {
      await authActions.loginWithGoogle()
      toast.success('Autenticação com Google concluída')
      window.location.href = '/'
    } catch (err) {
      toast.error(
        `Erro ao autenticar com Google: ${err instanceof Error ? err.message : String(err)}`,
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div class="min-h-screen flex items-center justify-center py-12 px-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <A href="/" class="inline-flex items-center gap-2 mb-4">
            <div class="h-12 w-12 rounded-full bg-linear-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
              <Recycle class="h-7 w-7 text-primary-950" />
            </div>
            <span class="font-bold text-2xl bg-linear-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
              ReciclaMais
            </span>
          </A>
          <h1 class="text-3xl font-bold">Bem-vindo</h1>
          <p class="text-muted-foreground mt-2">
            Entre ou crie uma conta para começar
          </p>
        </div>

        <div class="w-full">
          <Tabs defaultValue="login">
            <TabsList class="w-full flex gap-4 justify-between bg-base-100 ">
              <div class="flex-1 text-center m-0 bg-base-200 rounded-full ">
                <TabsTrigger value="login">Entrar</TabsTrigger>
              </div>
              <div class="flex-1 text-center bg-base-200 rounded-full">
                <TabsTrigger value="register">Registar</TabsTrigger>
              </div>
            </TabsList>

            <TabsContent value="login">
              <Card class="shadow-lg">
                <CardHeader>
                  <CardTitle>Iniciar sessão</CardTitle>
                  <CardDescription>
                    Inicie sessão com o seu email e palavra-passe
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => void handleLogin(e)} class="space-y-4">
                    <div class="space-y-2">
                      <Label for="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="seu@email.com"
                        autocomplete="email"
                        required
                        value={loginEmail()}
                        onInput={(e) =>
                          setLoginEmail((e.target as HTMLInputElement).value)
                        }
                      />
                    </div>
                    <div class="space-y-2">
                      <Label for="login-password">Palavra-passe</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        autocomplete="current-password"
                        required
                        value={loginPassword()}
                        onInput={(e) =>
                          setLoginPassword((e.target as HTMLInputElement).value)
                        }
                      />
                    </div>
                    <Button
                      type="submit"
                      class="w-full text-primary-content"
                      disabled={isLoading()}
                    >
                      {isLoading() ? 'A entrar...' : 'Entrar'}
                    </Button>

                    <div class="">
                      <Button
                        type="button"
                        class="w-full  text-primary-content"
                        onClick={() => void handleGoogle()}
                        disabled={isLoading()}
                      >
                        {isLoading() ? 'A autenticar...' : 'Entrar com Google'}
                      </Button>
                    </div>
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
                  <form
                    onSubmit={(e) => void handleRegister(e)}
                    class="space-y-4"
                  >
                    <div class="space-y-2">
                      <Label for="register-name">Nome Completo</Label>
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="João Silva"
                        autocomplete="name"
                        required
                        value={registerName()}
                        onInput={(e) =>
                          setRegisterName((e.target as HTMLInputElement).value)
                        }
                      />
                    </div>
                    <div class="space-y-2">
                      <Label for="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="seu@email.com"
                        autocomplete="email"
                        required
                        value={registerEmail()}
                        onInput={(e) =>
                          setRegisterEmail((e.target as HTMLInputElement).value)
                        }
                      />
                    </div>
                    <div class="space-y-2">
                      <Label for="register-password">Palavra-passe</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        autocomplete="new-password"
                        required
                        value={registerPassword()}
                        onInput={(e) =>
                          setRegisterPassword(
                            (e.target as HTMLInputElement).value,
                          )
                        }
                      />
                    </div>
                    <div class="space-y-2">
                      <Label for="register-confirm">
                        Confirmar palavra-passe
                      </Label>
                      <Input
                        id="register-confirm"
                        type="password"
                        placeholder="••••••••"
                        autocomplete="new-password"
                        required
                        value={registerConfirm()}
                        onInput={(e) =>
                          setRegisterConfirm(
                            (e.target as HTMLInputElement).value,
                          )
                        }
                      />
                    </div>
                    <Button
                      type="submit"
                      class="w-full text-primary-content"
                      disabled={isLoading()}
                    >
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
