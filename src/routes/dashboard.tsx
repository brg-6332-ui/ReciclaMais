import {
  Calendar,
  Gift,
  Leaf,
  Recycle,
  Trash2,
  TrendingUp,
  Weight,
} from 'lucide-solid'
import { createSignal, For, Show } from 'solid-js'

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

  const handleDeleteActivity = async (id: number) => {
    // confirm deletion with the user

    if (!confirm('Tem certeza que deseja remover esta atividade?')) return

    try {
      setDeletingId(id)
      const { error } = await supabase.from('activities').delete().eq('id', id)
      if (error) throw error
      dashboard.reFetch()
    } catch (err) {
      console.error('Erro ao remover atividade:', err)

      alert('Falha ao remover atividade. Tente novamente mais tarde.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div class="min-h-screen py-12">
      <div class="container mx-auto px-4">
        {/* User Header */}
        <div class="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <Avatar class="h-16 w-16">
              <AvatarFallback class="bg-linear-to-br from-primary-500 to-accent-500 text-primary-950 text-xl">
                {userInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 class="text-3xl font-bold">
                <Show when={authState().isAuthenticated} fallback="Visitante">
                  {userEmail().split('@')[0]}
                </Show>
              </h1>
              <p class="text-muted-foreground">
                <Show
                  when={dashboard.state() === 'success'}
                  fallback="Carregando..."
                >
                  {dashboard.recentActivities().length} atividades registradas
                </Show>
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <Button variant="outline" onClick={handleAddRecycling}>
              Adicionar Reciclagem
            </Button>
            <Button variant="outline">Editar Perfil</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card class="shadow-md">
            <CardHeader class="pb-3">
              <CardDescription class="flex items-center gap-2">
                <Weight class="h-4 w-4" />
                Total Reciclado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div class="text-3xl font-bold text-primary-500">
                {dashboard.stats().totalRecycled.toFixed(1)}kg
              </div>
            </CardContent>
          </Card>

          <Card class="shadow-md">
            <CardHeader class="pb-3">
              <CardDescription class="flex items-center gap-2">
                <Gift class="h-4 w-4" />
                Recompensas Totais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div class="text-3xl font-bold text-accent-500">
                {dashboard.stats().totalRewards.toFixed(2)}€
              </div>
            </CardContent>
          </Card>

          <Card class="shadow-md">
            <CardHeader class="pb-3">
              <CardDescription class="flex items-center gap-2">
                <Leaf class="h-4 w-4" />
                CO₂ Poupado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div class="text-3xl font-bold text-success">
                {dashboard.stats().co2Saved.toFixed(1)}kg
              </div>
            </CardContent>
          </Card>

          <Card class="shadow-md">
            <CardHeader class="pb-3">
              <CardDescription class="flex items-center gap-2">
                <TrendingUp class="h-4 w-4" />
                Taxa Reciclagem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div class="text-3xl font-bold text-primary-500">
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
                      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                        <div class="flex items-start gap-4">
                          <div class="h-12 w-12 rounded-lg bg-primary-500/10 flex items-center justify-center shrink-0">
                            <Recycle class="h-6 w-6 text-primary-500" />
                          </div>
                          <div>
                            <div class="flex items-center gap-2 mb-1">
                              <Badge variant="outline">
                                {MATERIAL_LABELS[activity.type] ??
                                  activity.type}
                              </Badge>
                              <span class="font-semibold">
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
                              {formatDate(activity.date)}
                            </div>
                          </div>
                        </div>
                        <div class="flex items-center gap-2">
                          <Gift class="h-4 w-4 text-accent-500" />
                          <span class="font-bold text-accent-500 text-lg">
                            {activity.reward.toFixed(2)}€
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Remover atividade"
                            disabled={deletingId() === activity.id}
                            onClick={() =>
                              void handleDeleteActivity(activity.id)
                            }
                          >
                            <Trash2 class="h-4 w-4 text-destructive" />
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
