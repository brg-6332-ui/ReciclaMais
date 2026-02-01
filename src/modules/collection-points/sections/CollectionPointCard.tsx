import { Clock, MapPin, Phone, Star } from 'lucide-solid'
import { For } from 'solid-js'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'

import { useTypeMetadata } from '../hooks/useTypeMetadata'
import type { CollectionPoint } from '../types'

interface CollectionPointCardProps {
  point: CollectionPoint
}

/**
 * Card component displaying a single collection point's information.
 * Shows name, company, rating, address, schedule, phone, and accepted waste types.
 */
export function CollectionPointCard(props: CollectionPointCardProps) {
  const { getTypeColor, getTypeLabel } = useTypeMetadata()

  return (
    <Card class="shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <CardHeader>
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <CardTitle class="text-xl mb-2">{props.point.name}</CardTitle>
            <CardDescription class="text-sm">
              {props.point.company}
            </CardDescription>
          </div>
          <div class="flex items-center gap-1 bg-accent-500/40 px-2 py-1 rounded-lg">
            <Star class="h-4 w-4 text-accent-500 fill-accent-500" />
            <span class="font-semibold">{props.point.rating}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-start gap-2 text-sm">
          <MapPin class="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <span class="text-muted-foreground">{props.point.address}</span>
        </div>

        <div class="flex items-center gap-2 text-sm">
          <Clock class="h-4 w-4 text-muted-foreground shrink-0" />
          <span class="text-muted-foreground">{props.point.schedule}</span>
        </div>

        <div class="flex items-center gap-2 text-sm">
          <Phone class="h-4 w-4 text-muted-foreground shrink-0" />
          <span class="text-muted-foreground">{props.point.phone}</span>
        </div>

        <div class="space-y-2">
          <div class="flex flex-wrap gap-2">
            <For each={props.point.types}>
              {(type) => (
                <Badge variant="outline" class={getTypeColor(type)}>
                  {getTypeLabel(type)}
                </Badge>
              )}
            </For>
          </div>
        </div>

        <Button class="w-full" variant="outline">
          Ver Detalhes
        </Button>
      </CardContent>
    </Card>
  )
}
