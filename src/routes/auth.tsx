import { A } from '@solidjs/router'
import { Loader2, Recycle } from 'lucide-solid'
import { createSignal, Show } from 'solid-js'
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
import { authActions } from '~/modules/auth/application/authActions'
import { AuthTabs, type AuthTabValue } from '~/modules/auth/ui/AuthTabs'
import { FormError } from '~/modules/auth/ui/FormError'
import {
  mapAuthError,
  validateLoginFields,
  validateRegistrationFields,
} from '~/modules/auth/utils/authErrors'
import { modalManager } from '~/modules/modal/core/modalManager'

/**
 * Opens a non-dismissable informational dialog telling the user to confirm
 * their e-mail address before signing in.
 */
function openEmailConfirmationModal(onClose?: () => void): void {
  modalManager.openModal({
    type: 'content',
    title: 'Confirmação de conta',
    closeOnOutsideClick: false,
    closeOnEscape: false,
    showCloseButton: false,
    onClose,
    content: (
      <div class="space-y-4 py-2">
        <p class="text-base-content/80 leading-relaxed">
          A sua conta foi criada com sucesso. Para poder iniciar sessão,
          precisará de{' '}
          <strong class="text-base-content font-semibold">
            confirmar o seu endereço de correio eletrónico
          </strong>
          . Por favor, verifique a sua caixa de entrada (e a pasta de spam) e
          clique na ligação de confirmação enviada pelo Recicla+.
        </p>
        <p class="text-sm text-muted-foreground">
          Após a confirmação, poderá iniciar sessão na aba <em>Entrar</em>.
        </p>
      </div>
    ),
    footer: (modalId) => (
      <div class="flex justify-end pt-2">
        <Button
          type="button"
          class="text-primary-content px-6"
          onClick={() => void modalManager.closeModal(modalId)}
        >
          OK, percebi
        </Button>
      </div>
    ),
  })
}

const Auth = () => {
  // ── Shared state ──
  const [isLoading, setIsLoading] = createSignal(false)
  const [errorMessage, setErrorMessage] = createSignal<string | undefined>()
  // ── Tab state (controlled so we can switch programmatically) ──
  const [activeTab, setActiveTab] = createSignal<AuthTabValue>('login')

  // ── Login fields ──
  const [loginEmail, setLoginEmail] = createSignal('')
  const [loginPassword, setLoginPassword] = createSignal('')

  // ── Register fields ──
  const [registerName, setRegisterName] = createSignal('')
  const [registerEmail, setRegisterEmail] = createSignal('')
  const [registerPassword, setRegisterPassword] = createSignal('')
  const [registerConfirm, setRegisterConfirm] = createSignal('')

  /** Clear errors when user switches tab or starts typing. */
  const clearError = () => setErrorMessage(undefined)

  const handleTabChange = (tab: AuthTabValue) => {
    clearError()
    setActiveTab(tab)
  }

  // ── Login handler ──
  const handleLogin = async (e: Event) => {
    e.preventDefault()
    clearError()

    const validationError = validateLoginFields({
      email: loginEmail(),
      password: loginPassword(),
    })
    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    setIsLoading(true)
    try {
      await authActions.signInWithEmail(loginEmail(), loginPassword())
      toast.success('Sessão iniciada com sucesso!')
      window.location.href = '/'
    } catch (err) {
      setErrorMessage(mapAuthError(err))
    } finally {
      setIsLoading(false)
    }
  }

  // ── Register handler ──
  const handleRegister = async (e: Event) => {
    e.preventDefault()
    clearError()

    const validationError = validateRegistrationFields({
      name: registerName(),
      email: registerEmail(),
      password: registerPassword(),
      confirm: registerConfirm(),
    })
    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    setIsLoading(true)
    try {
      const result = await authActions.signUpWithEmail(
        registerEmail(),
        registerPassword(),
      )

      // Supabase returns a user with empty identities when the email
      // is already registered (to prevent enumeration). Detect this
      // and show a friendly message instead of silently redirecting.
      const identities = result?.user?.identities
      if (identities !== undefined && identities.length === 0) {
        setErrorMessage('Este email já está registado. Tente iniciar sessão.')
        return
      }

      // Switch to the login tab and show the email confirmation dialog.
      setActiveTab('login')
      clearError()
      openEmailConfirmationModal()
    } catch (err) {
      setErrorMessage(mapAuthError(err))
    } finally {
      setIsLoading(false)
    }
  }

  // ── Google handler ──
  const handleGoogle = async () => {
    clearError()
    setIsLoading(true)
    try {
      await authActions.loginWithGoogle()
      toast.success('Autenticação com Google concluída')
      window.location.href = '/'
    } catch (err) {
      setErrorMessage(mapAuthError(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div class="min-h-screen flex items-center justify-center py-12 px-4">
      <div class="w-full max-w-md">
        {/* ── Header ── */}
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

        {/* ── AuthTabs segmented control + forms (controlled) ── */}
        <AuthTabs value={activeTab} onChange={handleTabChange}>
          {(activeTab) => (
            <>
              {/* ── Login form ── */}
              <Show when={activeTab() === 'login'}>
                <Card class="shadow-lg transition-shadow duration-200 hover:shadow-xl">
                  <CardHeader>
                    <CardTitle>Iniciar sessão</CardTitle>
                    <CardDescription>
                      Inicie sessão com o seu email e palavra-passe
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={(e) => void handleLogin(e)}
                      class="space-y-5"
                    >
                      <div class="space-y-1.5">
                        <Label
                          for="login-email"
                          class="font-medium text-base-content/90"
                        >
                          Email
                        </Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="seu@email.com"
                          autocomplete="email"
                          required
                          value={loginEmail()}
                          onInput={(e) => {
                            clearError()
                            setLoginEmail((e.target as HTMLInputElement).value)
                          }}
                          class="transition-colors duration-150"
                        />
                      </div>
                      <div class="space-y-1.5">
                        <Label
                          for="login-password"
                          class="font-medium text-base-content/90"
                        >
                          Palavra-passe
                        </Label>
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          autocomplete="current-password"
                          required
                          value={loginPassword()}
                          onInput={(e) => {
                            clearError()
                            setLoginPassword(
                              (e.target as HTMLInputElement).value,
                            )
                          }}
                          class="transition-colors duration-150"
                        />
                      </div>

                      {/* Contextual error */}
                      <FormError message={errorMessage()} />

                      <Button
                        type="submit"
                        class="w-full text-primary-content h-11 font-semibold shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]"
                        disabled={isLoading()}
                      >
                        <Show when={isLoading()} fallback="Entrar">
                          <Loader2 class="h-4 w-4 animate-spin" />
                          <span>A entrar…</span>
                        </Show>
                      </Button>

                      <div class="relative flex items-center py-1">
                        <div class="flex-1 border-t border-base-300" />
                        <span class="mx-3 text-xs text-muted-foreground">
                          ou
                        </span>
                        <div class="flex-1 border-t border-base-300" />
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        class="w-full h-11 font-medium transition-all duration-200 hover:shadow-sm active:scale-[0.98]"
                        onClick={() => void handleGoogle()}
                        disabled={isLoading()}
                      >
                        <Show when={isLoading()} fallback="Entrar com Google">
                          <Loader2 class="h-4 w-4 animate-spin" />
                          <span>A autenticar…</span>
                        </Show>
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </Show>

              {/* ── Register form ── */}
              <Show when={activeTab() === 'register'}>
                <Card class="shadow-lg transition-shadow duration-200 hover:shadow-xl">
                  <CardHeader>
                    <CardTitle>Criar Conta</CardTitle>
                    <CardDescription>
                      Preencha os dados para criar a sua conta
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={(e) => void handleRegister(e)}
                      class="space-y-5"
                    >
                      <div class="space-y-1.5">
                        <Label
                          for="register-name"
                          class="font-medium text-base-content/90"
                        >
                          Nome Completo
                        </Label>
                        <Input
                          id="register-name"
                          type="text"
                          placeholder="João Silva"
                          autocomplete="name"
                          required
                          value={registerName()}
                          onInput={(e) => {
                            clearError()
                            setRegisterName(
                              (e.target as HTMLInputElement).value,
                            )
                          }}
                          class="transition-colors duration-150"
                        />
                      </div>
                      <div class="space-y-1.5">
                        <Label
                          for="register-email"
                          class="font-medium text-base-content/90"
                        >
                          Email
                        </Label>
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="seu@email.com"
                          autocomplete="email"
                          required
                          value={registerEmail()}
                          onInput={(e) => {
                            clearError()
                            setRegisterEmail(
                              (e.target as HTMLInputElement).value,
                            )
                          }}
                          class="transition-colors duration-150"
                        />
                      </div>
                      <div class="space-y-1.5">
                        <Label
                          for="register-password"
                          class="font-medium text-base-content/90"
                        >
                          Palavra-passe
                        </Label>
                        <Input
                          id="register-password"
                          type="password"
                          placeholder="••••••••"
                          autocomplete="new-password"
                          required
                          value={registerPassword()}
                          onInput={(e) => {
                            clearError()
                            setRegisterPassword(
                              (e.target as HTMLInputElement).value,
                            )
                          }}
                          class="transition-colors duration-150"
                        />
                      </div>
                      <div class="space-y-1.5">
                        <Label
                          for="register-confirm"
                          class="font-medium text-base-content/90"
                        >
                          Confirmar palavra-passe
                        </Label>
                        <Input
                          id="register-confirm"
                          type="password"
                          placeholder="••••••••"
                          autocomplete="new-password"
                          required
                          value={registerConfirm()}
                          onInput={(e) => {
                            clearError()
                            setRegisterConfirm(
                              (e.target as HTMLInputElement).value,
                            )
                          }}
                          class="transition-colors duration-150"
                        />
                      </div>

                      {/* Contextual error */}
                      <FormError message={errorMessage()} />

                      <Button
                        type="submit"
                        class="w-full text-primary-content h-11 font-semibold shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]"
                        disabled={isLoading()}
                      >
                        <Show when={isLoading()} fallback="Criar Conta">
                          <Loader2 class="h-4 w-4 animate-spin" />
                          <span>A criar conta…</span>
                        </Show>
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </Show>
            </>
          )}
        </AuthTabs>

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
