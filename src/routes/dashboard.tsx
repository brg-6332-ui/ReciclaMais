import {
  Calendar,
  Gift,
  Loader2,
  Recycle,
  Trash2,
  User,
  Weight,
} from 'lucide-solid'
import { createSignal, For, Show } from 'solid-js'
import { toast } from 'solid-toast'

import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
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
 * Material type icons background colors.
 */
const MATERIAL_COLORS: Record<MaterialType, string> = {
  plastic: 'bg-blue-50 text-blue-600',
  glass: 'bg-teal-50 text-teal-600',
  paper: 'bg-amber-50 text-amber-600',
  metal: 'bg-slate-100 text-slate-600',
}

/**
 * Formats a date string to a readable Portuguese format.
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'short',
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
    <div class="min-h-screen bg-linear-to-b from-slate-50 to-slate-100/50">
      <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* User Header - Single cohesive row */}
        <header class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-3">
            <Avatar class="h-11 w-11 shrink-0 rounded-full ring-2 ring-emerald-500/20">
              <AvatarFallback class="bg-emerald-600 text-sm font-semibold text-white">
                {userInitials()}
              </AvatarFallback>
            </Avatar>
            <div class="min-w-0">
              <h1 class="truncate text-lg font-semibold text-slate-900">
                <Show when={authState().isAuthenticated} fallback="Visitante">
                  {userEmail().split('@')[0]}
                </Show>
              </h1>
              <p class="text-xs text-slate-500">
                <Show
                  when={dashboard.state() === 'success'}
                  fallback="Carregando..."
                >
                  {dashboard.recentActivities().length} atividades
                </Show>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <Button
              variant="hero"
              onClick={handleAddRecycling}
              class="shadow-sm"
            >
              <Recycle class="mr-2 h-4 w-4" />
              Adicionar
            </Button>
            <Button
              variant="ghost"
              size="icon"
              class="text-slate-500"
              aria-label="Editar perfil"
            >
              <User class="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* KPI Grid - 4 columns, primary card spans 2 */}
        <section class="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {/* Primary KPI - Total Reciclado */}
          <Card class="col-span-2 overflow-hidden rounded-2xl border-0 bg-linear-to-br from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/20">
            <CardContent class="p-5 sm:p-6">
              <div class="flex items-start justify-between">
                <div>
                  <p class="mb-1 text-xs font-medium uppercase tracking-wide text-emerald-100">
                    Total Reciclado
                  </p>
                  <div class="flex items-baseline gap-1.5">
                    <span class="text-4xl font-extrabold tracking-tight sm:text-5xl">
                      {dashboard.stats().totalRecycled.toFixed(1)}
                    </span>
                    <span class="text-lg font-medium text-emerald-200">kg</span>
                  </div>
                  <p class="mt-2 text-xs text-emerald-100/80">
                    Impacto positivo na comunidade
                  </p>
                </div>
                <div class="rounded-xl bg-white/10 p-2.5">
                  <Weight class="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Secondary KPI - Recompensas */}
          <Card class="rounded-xl border border-slate-200/60 bg-white shadow-sm">
            <CardContent class="p-4 sm:p-5">
              <div class="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
                <Gift class="h-4 w-4 text-amber-500" />
              </div>
              <p class="mb-0.5 text-xs font-medium text-slate-500">
                Recompensas
              </p>
              <p class="text-2xl font-bold text-amber-600 sm:text-3xl">
                {dashboard.stats().totalRewards.toFixed(2)}
                <span class="text-lg">€</span>
              </p>
            </CardContent>
          </Card>

          {/* Secondary KPI - Reciclado este mês */}
          <Card class="rounded-xl border border-slate-200/60 bg-white shadow-sm">
            <CardContent class="p-4 sm:p-5">
              <div class="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                <Calendar class="h-4 w-4 text-emerald-600" />
              </div>
              <p class="mb-0.5 text-xs font-medium text-slate-500">
                Reciclado este mês
              </p>
              <div class="flex items-baseline gap-2">
                <p class="text-2xl font-bold text-emerald-600 sm:text-3xl">
                  {dashboard.stats().recycledThisMonth.toFixed(1)}
                  <span class="text-lg font-medium text-slate-400">kg</span>
                </p>
                <Show
                  when={
                    dashboard.stats().recycledThisMonthDeltaPercent !== null
                  }
                >
                  <span
                    class="ml-2 rounded-md px-2 py-0.5 text-xs font-medium"
                    classList={{
                      'bg-emerald-100 text-emerald-800':
                        dashboard.stats().recycledThisMonthDeltaPercent! > 0,
                      'bg-slate-100 text-slate-700':
                        dashboard.stats().recycledThisMonthDeltaPercent! === 0,
                      'bg-red-100 text-red-700':
                        dashboard.stats().recycledThisMonthDeltaPercent! < 0,
                    }}
                  >
                    {dashboard.stats().recycledThisMonthDeltaPercent! > 0
                      ? '▲'
                      : dashboard.stats().recycledThisMonthDeltaPercent! < 0
                        ? '▼'
                        : ''}
                    {Math.abs(
                      dashboard.stats().recycledThisMonthDeltaPercent!,
                    ).toFixed(1)}
                    %
                  </span>
                </Show>
              </div>
            </CardContent>
          </Card>

          {/* Secondary KPI - Frequência de reciclagem (entregas este mês) */}
          <Card class="col-span-2 rounded-xl border border-slate-200/60 bg-white shadow-sm lg:col-span-1 lg:hidden xl:block">
            <CardContent class="flex items-center gap-4 p-4 sm:p-5 lg:block">
              <div class="mb-0 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 lg:mb-3">
                <Calendar class="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <p class="mb-0.5 text-xs font-medium text-slate-500">
                  Entregas este mês
                </p>
                <p class="text-2xl font-bold text-slate-700 sm:text-3xl">
                  {dashboard.stats().deliveriesThisMonth}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Loading State */}
        <Show when={dashboard.state() === 'loading'}>
          <Card class="rounded-xl border border-slate-200/60 bg-white shadow-sm">
            <CardContent class="flex items-center justify-center p-12">
              <Loader2 class="mr-3 h-5 w-5 animate-spin text-emerald-600" />
              <p class="text-slate-500">Carregando atividades...</p>
            </CardContent>
          </Card>
        </Show>

        {/* Error State */}
        <Show when={dashboard.state() === 'error'}>
          <Card class="rounded-xl border border-red-200 bg-red-50 shadow-sm">
            <CardContent class="p-6 text-center">
              <p class="mb-4 text-red-600">
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
          <section class="rounded-2xl border border-slate-200/60 bg-white shadow-sm">
            <CardHeader class="border-b border-slate-100 px-5 py-4 sm:px-6">
              <div class="flex items-center justify-between">
                <CardTitle class="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <Recycle class="h-4 w-4 text-emerald-600" />
                  Atividade Recente
                </CardTitle>
                <span class="text-xs text-slate-400">
                  Últimas {dashboard.recentActivities().length} entregas
                </span>
              </div>
            </CardHeader>
            <div class="divide-y divide-slate-100">
              <Show
                when={dashboard.recentActivities().length > 0}
                fallback={
                  <div class="px-5 py-12 text-center sm:px-6">
                    <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                      <Recycle class="h-6 w-6 text-slate-400" />
                    </div>
                    <p class="mb-4 text-sm text-slate-500">
                      Nenhuma atividade registrada ainda.
                    </p>
                    <Button variant="hero" onClick={handleAddRecycling}>
                      Adicionar primeira reciclagem
                    </Button>
                  </div>
                }
              >
                <For each={dashboard.recentActivities()}>
                  {(activity) => (
                    <div class="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50 sm:gap-4 sm:px-6">
                      {/* Icon */}
                      <div
                        class={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${MATERIAL_COLORS[activity.type] ?? 'bg-slate-100 text-slate-600'}`}
                      >
                        <Recycle class="h-5 w-5" />
                      </div>

                      {/* Material & Date */}
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-2">
                          <span class="font-medium text-slate-900">
                            {MATERIAL_LABELS[activity.type] ?? activity.type}
                          </span>
                          <Badge
                            variant="outline"
                            class="hidden text-xs sm:inline-flex"
                          >
                            {activity.amount.toFixed(2)} kg
                          </Badge>
                        </div>
                        <p class="flex items-center gap-1.5 text-xs text-slate-500">
                          <Calendar class="h-3 w-3" />
                          {formatDate(activity.date)}
                          <Show when={activity.location}>
                            <span class="text-slate-300">•</span>
                            <span class="truncate">{activity.location}</span>
                          </Show>
                        </p>
                      </div>

                      {/* Amount - Mobile */}
                      <div class="text-right sm:hidden">
                        <span class="text-sm font-semibold text-emerald-600">
                          {activity.amount.toFixed(1)} kg
                        </span>
                      </div>

                      {/* Reward */}
                      <div class="hidden shrink-0 items-center gap-1.5 sm:flex">
                        <Gift class="h-4 w-4 text-amber-500" />
                        <span class="font-semibold text-amber-600">
                          {activity.reward.toFixed(2)}€
                        </span>
                      </div>

                      {/* Delete */}
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Remover atividade"
                        class="h-8 w-8 shrink-0 text-slate-400 hover:text-red-500"
                        disabled={deletingId() === activity.id}
                        onClick={() => void handleDeleteActivity(activity.id)}
                      >
                        <Show
                          when={deletingId() === activity.id}
                          fallback={<Trash2 class="h-4 w-4" />}
                        >
                          <Loader2 class="h-4 w-4 animate-spin" />
                        </Show>
                      </Button>
                    </div>
                  )}
                </For>
              </Show>
            </div>
          </section>
        </Show>
      </div>
    </div>
  )
}

export default Dashboard
