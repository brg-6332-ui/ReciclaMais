import {
  Calendar,
  Gift,
  Leaf,
  Loader2,
  Recycle,
  Search,
  Trash2,
  TrendingUp,
  Weight,
} from 'lucide-solid'
import { createSignal, For, Show } from 'solid-js'
import { toast } from 'solid-toast'

import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import type { MaterialType } from '~/modules/activity/domain/activity'
import { openActivityAddModal } from '~/modules/activity/ui/ActivityAddModal'
import { useAuthState } from '~/modules/auth/application/authState'
import { useDashboard } from '~/modules/dashboard/hooks/useDashboard'
import { openConfirmModal } from '~/modules/modal/helpers/modalHelpers'
import { supabase } from '~/shared/infrastructure/supabase/supabase'

/**
 * Material type labels in Portuguese.
 */
const MATERIAL_LABELS: Record<MaterialType, string> = {
  plastic: 'Plástico',
  glass: 'Vidro',
  paper: 'Papel',
  metal: 'Metal',
}

/**
 * Formats a date string to a readable Portuguese format.
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Gets user initials from email.
 */
function getUserInitials(email: string): string {
  const parts = email.split('@')[0].split(/[._-]/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return email.substring(0, 2).toUpperCase()
}

const Dashboard = () => {
  const { authState } = useAuthState()
  const dashboard = useDashboard()

  const [deletingId, setDeletingId] = createSignal<number | null>(null)

  const userEmail = () => {
    const auth = authState()
    return auth.isAuthenticated
      ? (auth.session.user.email ?? 'user@example.com')
      : ''
  }

  const userInitials = () => getUserInitials(userEmail())

  const handleAddRecycling = () => {
    openActivityAddModal({
      onSuccess: () => {
        dashboard.reFetch()
      },
    })
  }

  const handleDeleteActivity = (id: number) => {
    openConfirmModal('Tem certeza que deseja remover esta atividade?', {
      title: 'Remover atividade',
      confirmText: 'Remover',
      cancelText: 'Cancelar',
      async onConfirm() {
        try {
          setDeletingId(id)
          const { error } = await supabase
            .from('activities')
            .delete()
            .eq('id', id)
          if (error) throw error
          toast.success('Atividade removida com sucesso')
          dashboard.reFetch()
        } catch (err) {
          console.error('Erro ao remover atividade:', err)
          toast.error('Falha ao remover atividade. Tente novamente mais tarde.')
        } finally {
          setDeletingId(null)
        }
      },
    })
  }

  return (
    <div class="min-h-screen py-12 bg-[rgb(250,250,247)]">
      <div class="container mx-auto px-6 max-w-5xl">
        {/* User Header */}
        <div class="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <Avatar class="h-16 w-16 rounded-xl ring-1 ring-emerald-100 shadow-sm">
              <AvatarFallback class="bg-emerald-100 text-emerald-800 text-xl font-semibold">
                {userInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 class="text-3xl font-extrabold text-emerald-800 leading-tight">
                <Show when={authState().isAuthenticated} fallback="Visitante">
                  {userEmail().split('@')[0]}
                </Show>
              </h1>
              <p class="text-sm text-muted-foreground mt-1">
                <Show
                  when={dashboard.state() === 'success'}
                  fallback="Carregando..."
                >
                  {dashboard.recentActivities().length} atividades registradas
                </Show>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-4 w-full md:w-auto">
            <div class="hidden md:flex items-center bg-white rounded-lg shadow-sm border border-gray-100 px-3 py-2 w-80">
              <Search class="h-4 w-4 text-muted-foreground mr-2" />
              <input
                class="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                placeholder="Procurar atividades, materiais..."
                aria-label="Pesquisar"
              />
            </div>

            <div class="flex items-center gap-3">
              <Button
                variant="hero"
                onClick={handleAddRecycling}
                class="shadow-[0_6px_14px_rgba(34,197,94,0.12)]"
              >
                Adicionar Reciclagem
              </Button>
              <Button variant="outline" class="hidden sm:inline-flex">
                Editar Perfil
              </Button>
              <Button variant="ghost" size="icon" aria-label="Navegação">
                <TrendingUp class="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card class="shadow-sm lg:col-span-2 rounded-2xl border-[0.5px]">
            <CardHeader class="pb-1">
              <CardDescription class="flex items-center gap-3">
                <Weight class="h-5 w-5 text-emerald-600" />
                <div class="text-sm text-muted-foreground">Total Reciclado</div>
              </CardDescription>
            </CardHeader>
            <CardContent class="pt-2">
              <div class="text-5xl md:text-6xl font-extrabold text-emerald-700 leading-none">
                {dashboard.stats().totalRecycled.toFixed(1)}
                <span class="text-xl font-medium text-muted-foreground">
                  kg
                </span>
              </div>
              <p class="mt-2 text-sm text-muted-foreground max-w-prose">
                Impacto positivo: obrigado por contribuir para comunidades mais
                limpas.
              </p>
            </CardContent>
          </Card>

          <Card class="shadow-sm rounded-xl border-[0.5px]">
            <CardHeader class="pb-1">
              <CardDescription class="flex items-center gap-3">
                <Gift class="h-5 w-5 text-amber-500" />
                <div class="text-sm text-muted-foreground">
                  Recompensas Totais
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent class="pt-2">
              <div class="text-3xl font-bold text-amber-600">
                {dashboard.stats().totalRewards.toFixed(2)}€
              </div>
            </CardContent>
          </Card>

          <Card class="shadow-sm rounded-xl border-[0.5px]">
            <CardHeader class="pb-1">
              <CardDescription class="flex items-center gap-3">
                <Leaf class="h-5 w-5 text-emerald-600" />
                <div class="text-sm text-muted-foreground">CO₂ Poupado</div>
              </CardDescription>
            </CardHeader>
            <CardContent class="pt-2">
              <div class="text-3xl font-bold text-emerald-600">
                {dashboard.stats().co2Saved.toFixed(1)}kg
              </div>
            </CardContent>
          </Card>

          <Card class="shadow-sm rounded-xl border-[0.5px]">
            <CardHeader class="pb-1">
              <CardDescription class="flex items-center gap-3">
                <TrendingUp class="h-5 w-5 text-muted-foreground" />
                <div class="text-sm text-muted-foreground">Taxa Reciclagem</div>
              </CardDescription>
            </CardHeader>
            <CardContent class="pt-2">
              <div class="text-3xl font-bold text-emerald-700">
                {dashboard.stats().recyclingRate}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        <Show when={dashboard.state() === 'loading'}>
          <Card class="shadow-lg">
            <CardContent class="p-8 text-center">
              <p class="text-muted-foreground">Carregando atividades...</p>
            </CardContent>
          </Card>
        </Show>

        {/* Error State */}
        <Show when={dashboard.state() === 'error'}>
          <Card class="shadow-lg border-destructive">
            <CardContent class="p-8 text-center">
              <p class="text-destructive mb-4">
                Erro ao carregar dados: {dashboard.error()?.message}
              </p>
              <Button variant="outline" onClick={() => dashboard.reFetch()}>
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        </Show>

        {/* Recent Activity */}
        <Show when={dashboard.state() === 'success'}>
          <Card class="shadow-lg">
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <Recycle class="h-5 w-5" />
                Atividade Recente
              </CardTitle>
              <CardDescription>
                Histórico das suas entregas de reciclagem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Show
                when={dashboard.recentActivities().length > 0}
                fallback={
                  <div class="text-center py-8">
                    <Recycle class="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p class="text-muted-foreground mb-4">
                      Nenhuma atividade registrada ainda.
                    </p>
                    <Button variant="hero" onClick={handleAddRecycling}>
                      Adicionar sua primeira reciclagem
                    </Button>
                  </div>
                }
              >
                <div class="space-y-4">
                  <For each={dashboard.recentActivities()}>
                    {(activity) => (
                      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-transparent bg-white/60 hover:shadow-md transition-shadow">
                        <div class="flex items-start gap-4">
                          <div class="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                            <Recycle class="h-6 w-6 text-emerald-600" />
                          </div>
                          <div>
                            <div class="flex items-center gap-2 mb-1">
                              <Badge variant="outline">
                                {MATERIAL_LABELS[activity.type] ??
                                  activity.type}
                              </Badge>
                              <span class="font-semibold text-emerald-700">
                                {activity.amount.toFixed(2)}kg
                              </span>
                            </div>
                            <Show when={activity.location}>
                              <p class="text-sm text-muted-foreground">
                                {activity.location}
                              </p>
                            </Show>
                            <div class="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <Calendar class="h-3 w-3" />
                              {formatDate(activity.date)} •
                              <span class="ml-1 font-mono text-xs text-muted-foreground">
                                {String(activity.id).slice(0, 8)}…
                              </span>
                            </div>
                          </div>
                        </div>
                        <div class="flex items-center gap-3">
                          <div class="flex items-center gap-2">
                            <Gift class="h-4 w-4 text-amber-500" />
                            <span class="font-bold text-amber-600 text-lg">
                              {activity.reward.toFixed(2)}€
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Remover atividade"
                            disabled={deletingId() === activity.id}
                            onClick={() =>
                              void handleDeleteActivity(activity.id)
                            }
                          >
                            <Show
                              when={deletingId() === activity.id}
                              fallback={
                                <Trash2 class="h-4 w-4 text-destructive" />
                              }
                            >
                              <Loader2 class="h-4 w-4 text-destructive animate-spin" />
                            </Show>
                          </Button>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </Show>
            </CardContent>
          </Card>
        </Show>
      </div>
    </div>
  )
}

export default Dashboard
