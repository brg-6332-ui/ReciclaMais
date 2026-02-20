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
import { cn } from '~/utils/cn'

import { useTypeMetadata } from '../hooks/useTypeMetadata'
import type { CollectionPoint } from '../types'

interface CollectionPointCardProps {
  point: CollectionPoint
  /** Whether this card is currently selected */
  selected?: boolean
  /** Callback when user selects this point */
  onSelect?: (point: CollectionPoint) => void
}

/**
 * Card component displaying a single collection point's information.
 * Shows name, company, rating, address, schedule, phone, and accepted waste types.
 */
export function CollectionPointCard(props: CollectionPointCardProps) {
  const { getTypeColor, getTypeLabel } = useTypeMetadata()

  const handleSelect = () => {
    props.onSelect?.(props.point)
  }

  return (
    <Card
      class={cn(
        'shadow-sm border border-base-300/50 hover:shadow-md hover:border-base-400/60 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer',
        props.selected && 'ring-2 ring-primary-400 shadow-md -translate-y-0.5',
      )}
      onClick={handleSelect}
    >
      <CardHeader>
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <CardTitle class="text-xl mb-2">{props.point.name}</CardTitle>
            <CardDescription class="text-sm">
              {props.point.company}
            </CardDescription>
          </div>
          <div class="flex items-center gap-1 bg-primary-100/60 border border-primary-300/40 px-2.5 py-1 rounded-md">
            <Star class="h-3.5 w-3.5 text-primary-600 fill-primary-600" />
            <span class="text-sm font-medium text-primary-800">
              {props.point.rating}
            </span>
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

        <Button class="w-full" variant="outline" onClick={handleSelect}>
          Ver Detalhes
        </Button>
      </CardContent>
    </Card>
  )
}
