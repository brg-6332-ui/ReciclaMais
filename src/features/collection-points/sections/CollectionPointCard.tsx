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
        'border border-base-400/40 shadow-sm hover:shadow-md hover:border-primary-500/30 transition-all duration-200 cursor-pointer group',
        props.selected &&
          'ring-2 ring-primary-500/50 shadow-md border-primary-500/40',
      )}
      onClick={handleSelect}
    >
      <CardHeader>
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1">
            <CardTitle class="text-xl font-bold text-text-900 mb-1.5">
              {props.point.name}
            </CardTitle>
            <CardDescription class="text-sm text-text-500">
              {props.point.company}
            </CardDescription>
          </div>
          <div class="flex items-center gap-1.5 bg-primary-500/10 border border-primary-500/25 px-3 py-1.5 rounded-lg shadow-sm">
            <Star class="h-3.5 w-3.5 text-primary-600 fill-primary-600" />
            <span class="text-sm font-semibold text-primary-700">
              {props.point.rating}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-start gap-2.5 text-sm">
          <MapPin class="h-4 w-4 text-primary-600 group-hover:text-primary-500 mt-0.5 shrink-0 transition-colors" />
          <span class="text-text-500">{props.point.address}</span>
        </div>

        <div class="flex items-center gap-2.5 text-sm">
          <Clock class="h-4 w-4 text-primary-600 group-hover:text-primary-500 shrink-0 transition-colors" />
          <span class="text-text-500">{props.point.schedule}</span>
        </div>

        <div class="flex items-center gap-2.5 text-sm">
          <Phone class="h-4 w-4 text-primary-600 group-hover:text-primary-500 shrink-0 transition-colors" />
          <span class="text-text-500">{props.point.phone}</span>
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

        <Button
          class="w-full border-primary-500/30 hover:bg-primary-500/5 hover:border-primary-500/50"
          variant="outline"
          onClick={handleSelect}
        >
          Ver Detalhes
        </Button>
      </CardContent>
    </Card>
  )
}
