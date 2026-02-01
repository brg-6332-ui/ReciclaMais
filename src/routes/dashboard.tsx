import { Calendar, Gift, Leaf, Recycle, TrendingUp, Weight } from 'lucide-solid'
import { For } from 'solid-js'

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
import { openActivityAddModal } from '~/modules/activity/ui/ActivityAddModal'

const Dashboard = () => {
  const userStats = {
    totalRecycled: '127.5',
    totalRewards: '95.50',
    co2Saved: '384',
    recyclingRate: '92',
  }

  const recentActivities = [
    {
      date: '15 Out 2024',
      type: 'Plástico',
      amount: '25kg',
      reward: '10€',
      location: 'EcoPonto Central',
    },
    {
      date: '08 Out 2024',
      type: 'Vidro',
      amount: '40kg',
      reward: '15€',
      location: 'Ponto Verde Cascais',
    },
    {
      date: '02 Out 2024',
      type: 'Papel',
      amount: '30kg',
      reward: '12€',
      location: 'ReciclaPorto Centro',
    },
  ]
  return (
    <div class="min-h-screen py-12">
      <div class="container mx-auto px-4">
        {/* User Header */}
        <div class="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <Avatar class="h-16 w-16">
              <AvatarFallback class="bg-linear-to-br from-primary-500 to-accent-500 text-primary-950 text-xl">
                JS
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 class="text-3xl font-bold">João Silva</h1>
              <p class="text-muted-foreground">Membro desde Out 2024</p>
            </div>
          </div>
          <div class="flex gap-4">
            <Button variant="outline" onClick={openActivityAddModal}>
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
                {userStats.totalRecycled}kg
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
                {userStats.totalRewards}€
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
                {userStats.co2Saved}kg
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
                {userStats.recyclingRate}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
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
            <div class="space-y-4">
              <For each={recentActivities}>
                {(activity) => (
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                    <div class="flex items-start gap-4">
                      <div class="h-12 w-12 rounded-lg bg-primary-500/10 flex items-center justify-center shrink-0">
                        <Recycle class="h-6 w-6 text-primary-500" />
                      </div>
                      <div>
                        <div class="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{activity.type}</Badge>
                          <span class="font-semibold">{activity.amount}</span>
                        </div>
                        <p class="text-sm text-muted-foreground">
                          {activity.location}
                        </p>
                        <div class="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Calendar class="h-3 w-3" />
                          {activity.date}
                        </div>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <Gift class="h-4 w-4 text-accent-500" />
                      <span class="font-bold text-accent-500 text-lg">
                        {activity.reward}
                      </span>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
