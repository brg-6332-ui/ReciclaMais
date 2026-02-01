import { CheckCircle2, XCircle } from 'lucide-solid'
import { For } from 'solid-js'

import glassImage from '~/assets/glass-waste.jpg'
import metalImage from '~/assets/metal-waste.jpg'
import paperImage from '~/assets/paper-waste.jpg'
import plasticImage from '~/assets/plastic-waste.jpg'
import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

function RecyclingGuide() {
  const wasteTypes = [
    {
      name: 'Plástico',
      color: 'bg-info',
      image: plasticImage,
      accepted: [
        'Garrafas de água e refrigerantes',
        'Embalagens de produtos de limpeza',
        'Frascos de champô e gel de banho',
        'Sacos de plástico limpos',
        'Tampas de plástico',
      ],
      rejected: [
        'Plásticos sujos com restos de comida',
        'Fraldas e produtos de higiene',
        'Brinquedos de plástico',
        'Cabides de plástico',
      ],
      tips: 'Enxague as embalagens antes de reciclar. Retire rótulos sempre que possível.',
    },
    {
      name: 'Vidro',
      color: 'bg-success',
      image: glassImage,
      accepted: [
        'Garrafas de bebidas',
        'Frascos de conservas e doces',
        'Boiões de vidro',
        'Garrafões de vidro',
      ],
      rejected: [
        'Espelhos e vidros de janelas',
        'Louças e cerâmicas',
        'Lâmpadas e ecrãs',
        'Cristal',
      ],
      tips: 'Remova tampas metálicas ou de plástico. Não é necessário retirar rótulos de papel.',
    },
    {
      name: 'Papel e Cartão',
      color: 'bg-warning',
      image: paperImage,
      accepted: [
        'Jornais e revistas',
        'Caixas de cartão',
        'Papel de escritório',
        'Sacos de papel',
        'Cartolinas',
      ],
      rejected: [
        'Papel plastificado',
        'Papel de cozinha usado',
        'Lenços de papel',
        'Papel químico (fax)',
        'Guardanapos sujos',
      ],
      tips: 'Dobre as caixas de cartão para poupar espaço. Não amasse o papel.',
    },
    {
      name: 'Metal',
      color: 'bg-neutral',
      image: metalImage,
      accepted: [
        'Latas de bebidas',
        'Latas de conservas',
        'Aerossóis vazios',
        'Papel de alumínio limpo',
        'Tampas metálicas',
      ],
      rejected: [
        'Latas de tinta',
        'Pilhas e baterias',
        'Eletrodomésticos',
        'Panelas e tachos',
      ],
      tips: 'Enxague as latas antes de reciclar. Pode amassar para poupar espaço.',
    },
  ]

  return (
    <div class="min-h-screen py-12 bg-base-100">
      <div class="container mx-auto px-4">
        <div class="mb-12 text-center">
          <h1 class="text-4xl md:text-5xl font-bold mb-4">
            Guia de Reciclagem
          </h1>
          <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
            Aprenda a separar corretamente os seus resíduos e maximize o seu
            impacto ambiental
          </p>
        </div>

        <div class="grid lg:grid-cols-2 gap-8">
          <For each={wasteTypes}>
            {(waste) => (
              <Card class="shadow-lg bg-base-50 hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div class="flex items-center gap-4">
                    <div
                      class={`h-12 w-12 rounded-xl ${waste.color} flex items-center justify-center shadow-md`}
                    >
                      <span class="text-2xl">♻️</span>
                    </div>
                    <div>
                      <CardTitle class="text-2xl">{waste.name}</CardTitle>
                      <Badge variant="outline" class="mt-1">
                        Reciclável
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent class="space-y-6">
                  <div class="aspect-video rounded-lg overflow-hidden shadow-md">
                    <img
                      src={waste.image}
                      alt={waste.name}
                      class="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <h4 class="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle2 class="h-5 w-5 text-success" />
                      Pode reciclar
                    </h4>
                    <ul class="space-y-2">
                      <For each={waste.accepted}>
                        {(item) => (
                          <li class="text-sm text-muted-foreground flex items-start gap-2">
                            <span class="text-success mt-0.5">✓</span>
                            {item}
                          </li>
                        )}
                      </For>
                    </ul>
                  </div>

                  <div>
                    <h4 class="font-semibold mb-3 flex items-center gap-2">
                      <XCircle class="h-5 w-5 text-destructive" />
                      Não pode reciclar
                    </h4>
                    <ul class="space-y-2">
                      <For each={waste.rejected}>
                        {(item) => (
                          <li class="text-sm text-muted-foreground flex items-start gap-2">
                            <span class="text-destructive mt-0.5">✗</span>
                            {item}
                          </li>
                        )}
                      </For>
                    </ul>
                  </div>

                  <div class="bg-base-50 rounded-lg p-4">
                    <h4 class="font-semibold mb-2 text-sm">💡 Dica</h4>
                    <p class="text-sm text-muted-foreground">{waste.tips}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </For>
        </div>
      </div>
    </div>
  )
}

export default RecyclingGuide
