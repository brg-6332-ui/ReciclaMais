import {
  BookOpen,
  Globe,
  HandHeart,
  Heart,
  Leaf,
  Lock,
  MapPin,
  MessageCircle,
  Recycle,
  Search,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-solid'
import { createSignal, For, Show } from 'solid-js'
import { Motion, Presence } from 'solid-motionone'

import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

/**
 * Hero section organic shapes SVG component
 */
function HeroShapes() {
  return (
    <svg
      class="w-full h-full"
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Large organic blob */}
      <Motion.ellipse
        cx="200"
        cy="200"
        rx="150"
        ry="120"
        class="fill-primary-200/60"
        animate={{ rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, easing: 'ease-in-out' }}
      />
      {/* Medium blob */}
      <Motion.ellipse
        cx="280"
        cy="150"
        rx="80"
        ry="60"
        class="fill-accent-300/50"
        animate={{ rotate: [0, -3, 0] }}
        transition={{ duration: 6, repeat: Infinity, easing: 'ease-in-out' }}
      />
      {/* Small accent circle */}
      <Motion.circle
        cx="120"
        cy="280"
        r="40"
        class="fill-secondary-300/40"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity, easing: 'ease-in-out' }}
      />
      {/* Network dots */}
      <For
        each={[
          { cx: 150, cy: 120 },
          { cx: 250, cy: 100 },
          { cx: 320, cy: 180 },
          { cx: 280, cy: 280 },
          { cx: 180, cy: 300 },
          { cx: 100, cy: 200 },
          { cx: 200, cy: 180 },
        ]}
      >
        {(dot) => (
          <circle cx={dot.cx} cy={dot.cy} r="6" class="fill-primary-500/70" />
        )}
      </For>
      {/* Connecting lines */}
      <path
        d="M150 120 L200 180 L250 100 M200 180 L280 280 M200 180 L180 300 M100 200 L150 120 M320 180 L280 280"
        stroke-width="1.5"
        class="stroke-primary-400/40"
        fill="none"
      />
    </svg>
  )
}

/**
 * Section 1 - Hero
 */
function HeroSection() {
  return (
    <section class="relative min-h-[80vh] flex items-center overflow-hidden bg-linear-to-br from-base-100 via-primary-50 to-accent-100">
      <div class="container mx-auto px-6 py-20">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <Motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            class="space-y-6"
          >
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-base-content">
              A reciclagem pode ser simples.
              <br />
              <span class="text-primary-600">
                E a participação pode fazer a diferença.
              </span>
            </h1>
            <p class="text-lg md:text-xl text-text-500 max-w-xl">
              Recicla+ conecta cidadãos, tecnologia e pontos de recolha para
              tornar a reciclagem acessível, transparente e impactante.
            </p>
          </Motion.div>

          {/* Abstract Visual */}
          <Motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            class="hidden lg:block h-[400px]"
          >
            <HeroShapes />
          </Motion.div>
        </div>
      </div>
    </section>
  )
}

/**
 * Section 2 - The Problem
 */
function ProblemSection() {
  const challenges = [
    'Falta de informação sobre onde e como reciclar corretamente',
    'Pontos de recolha dispersos e difíceis de localizar',
    'Baixa visibilidade do impacto individual na reciclagem',
    'Desconexão entre cidadãos e infraestrutura de reciclagem',
  ]

  return (
    <section class="py-24 bg-base-100 relative">
      {/* Decorative vertical line */}
      <div class="absolute left-8 top-24 bottom-24 w-px bg-linear-to-b from-transparent via-primary-300 to-transparent hidden lg:block" />

      <div class="container mx-auto px-6">
        <div class="max-w-3xl lg:ml-16">
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 class="text-3xl md:text-4xl font-bold text-base-content mb-6">
              O Problema
            </h2>
            <p class="text-lg text-text-500 mb-10">
              A reciclagem ainda enfrenta barreiras significativas que limitam a
              participação cidadã e reduzem a eficácia dos sistemas de recolha
              seletiva.
            </p>
          </Motion.div>

          <ul class="space-y-4">
            <For each={challenges}>
              {(challenge, index) => (
                <Motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index() * 0.1 }}
                  class="flex items-start gap-4"
                >
                  <span class="shrink-0 w-2 h-2 mt-2.5 rounded-full bg-primary-500" />
                  <span class="text-base-content/80">{challenge}</span>
                </Motion.li>
              )}
            </For>
          </ul>
        </div>
      </div>
    </section>
  )
}

/**
 * Platform diagram component for Section 3
 */
function PlatformDiagram() {
  return (
    <div class="relative h-[400px] flex flex-col items-center justify-center gap-6">
      {/* User Layer */}
      <Motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        class="flex items-center gap-3 px-6 py-4 bg-accent-100 rounded-xl border border-accent-300"
      >
        <Users class="w-6 h-6 text-accent-700" />
        <span class="font-medium text-accent-700">Utilizador</span>
      </Motion.div>

      {/* Connector */}
      <div class="w-px h-8 bg-primary-300" />

      {/* Platform Layer */}
      <Motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        class="flex items-center gap-3 px-8 py-5 bg-primary-100 rounded-xl border-2 border-primary-400 shadow-lg"
      >
        <Sparkles class="w-7 h-7 text-primary-600" />
        <span class="font-semibold text-primary-700 text-lg">
          Plataforma Digital
        </span>
      </Motion.div>

      {/* Connector */}
      <div class="w-px h-8 bg-primary-300" />

      {/* Collection Points Layer */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        class="flex items-center gap-3 px-6 py-4 bg-secondary-100 rounded-xl border border-secondary-300"
      >
        <MapPin class="w-6 h-6 text-secondary-700" />
        <span class="font-medium text-secondary-700">Pontos de Recolha</span>
      </Motion.div>
    </div>
  )
}

/**
 * Section 3 - The Recicla+ Project
 */
function ProjectSection() {
  return (
    <section class="py-24 bg-base-200">
      <div class="container mx-auto px-6">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <Motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            class="space-y-6"
          >
            <h2 class="text-3xl md:text-4xl font-bold text-base-content">
              O Projeto Recicla+
            </h2>
            <p class="text-lg text-text-500">
              Recicla+ é uma plataforma digital que simplifica a reciclagem
              conectando cidadãos aos pontos de recolha mais próximos. Através
              de uma interface intuitiva, os utilizadores podem localizar
              ecopontos, aprender sobre separação de resíduos e acompanhar o
              impacto das suas ações.
            </p>
            <p class="text-text-500">
              A plataforma atua como ponte entre a comunidade e a infraestrutura
              de reciclagem existente, promovendo participação ativa e
              consciente. O objetivo é tornar a reciclagem parte natural do
              quotidiano, removendo barreiras e criando transparência.
            </p>
          </Motion.div>

          {/* Diagram - Sticky on scroll */}
          <div class="lg:sticky lg:top-24">
            <PlatformDiagram />
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Section 4 - How It Works
 */
function HowItWorksSection() {
  const steps = [
    {
      number: 1,
      title: 'Encontre',
      description: 'Localize os pontos de recolha mais próximos no mapa',
      icon: Search,
    },
    {
      number: 2,
      title: 'Aprenda',
      description: 'Saiba que materiais depositar em cada ecoponto',
      icon: BookOpen,
    },
    {
      number: 3,
      title: 'Recicle',
      description: 'Deposite os seus resíduos nos locais corretos',
      icon: Recycle,
    },
    {
      number: 4,
      title: 'Acompanhe',
      description: 'Veja o impacto das suas contribuições ao longo do tempo',
      icon: TrendingUp,
    },
  ]

  return (
    <section class="py-24 bg-base-100">
      <div class="container mx-auto px-6">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          class="text-center mb-16"
        >
          <h2 class="text-3xl md:text-4xl font-bold text-base-content mb-4">
            Como Funciona
          </h2>
          <p class="text-text-500 max-w-2xl mx-auto">
            Quatro passos simples para começar a reciclar de forma mais
            eficiente
          </p>
        </Motion.div>

        {/* Desktop: Horizontal layout */}
        <div class="hidden md:flex items-start justify-between relative">
          {/* Connecting line */}
          <div class="absolute top-12 left-[10%] right-[10%] h-0.5 bg-linear-to-r from-primary-200 via-primary-400 to-primary-200" />

          <For each={steps}>
            {(step, index) => (
              <Motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index() * 0.15 }}
                class="flex flex-col items-center text-center w-1/4 relative z-10"
              >
                <div class="w-24 h-24 rounded-full bg-primary-100 border-4 border-primary-400 flex items-center justify-center mb-4 shadow-md">
                  <step.icon class="w-10 h-10 text-primary-600" />
                </div>
                <span class="text-sm font-bold text-primary-500 mb-1">
                  Passo {step.number}
                </span>
                <h3 class="text-xl font-semibold text-base-content mb-2">
                  {step.title}
                </h3>
                <p class="text-sm text-text-500 max-w-[180px]">
                  {step.description}
                </p>
              </Motion.div>
            )}
          </For>
        </div>

        {/* Mobile: Vertical layout */}
        <div class="md:hidden space-y-8">
          <For each={steps}>
            {(step, index) => (
              <Motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index() * 0.1 }}
                class="flex items-start gap-4"
              >
                <div class="shrink-0 w-16 h-16 rounded-full bg-primary-100 border-2 border-primary-400 flex items-center justify-center">
                  <step.icon class="w-7 h-7 text-primary-600" />
                </div>
                <div>
                  <span class="text-sm font-bold text-primary-500">
                    Passo {step.number}
                  </span>
                  <h3 class="text-lg font-semibold text-base-content">
                    {step.title}
                  </h3>
                  <p class="text-sm text-text-500">{step.description}</p>
                </div>
              </Motion.div>
            )}
          </For>
        </div>
      </div>
    </section>
  )
}

/**
 * Section 5 - User's Role
 */
function UserRoleSection() {
  const roles = [
    {
      title: 'Contribuir',
      description:
        'Cada ação de reciclagem conta. Ao separar e depositar corretamente, contribui diretamente para a economia circular.',
      icon: HandHeart,
      rotation: -2,
    },
    {
      title: 'Aprender',
      description:
        'Descubra como reciclar diferentes materiais e entenda o destino dos resíduos que separa.',
      icon: BookOpen,
      rotation: 0,
    },
    {
      title: 'Impactar',
      description:
        'Acompanhe o impacto coletivo da comunidade e veja como a sua participação faz diferença.',
      icon: TrendingUp,
      rotation: 2,
    },
  ]

  return (
    <section class="py-24 bg-linear-to-br from-accent-100 via-base-100 to-primary-50">
      <div class="container mx-auto px-6">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          class="text-center mb-16"
        >
          <h2 class="text-3xl md:text-4xl font-bold text-base-content mb-4">
            O Seu Papel
          </h2>
          <p class="text-text-500 max-w-2xl mx-auto">
            A reciclagem eficaz depende da participação ativa de cada cidadão
          </p>
        </Motion.div>

        <div class="grid md:grid-cols-3 gap-8">
          <For each={roles}>
            {(role, index) => (
              <Motion.div
                initial={{ opacity: 0, y: 40, rotate: role.rotation }}
                animate={{ opacity: 1, y: 0, rotate: role.rotation }}
                transition={{ duration: 0.6, delay: index() * 0.15 }}
              >
                <Card class="h-full bg-base-100/80 backdrop-blur-sm border-primary-200 hover:shadow-xl transition-shadow duration-300">
                  <CardContent class="p-8 text-center">
                    <div class="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-6">
                      <role.icon class="w-8 h-8 text-primary-600" />
                    </div>
                    <h3 class="text-xl font-semibold text-base-content mb-3">
                      {role.title}
                    </h3>
                    <p class="text-text-500">{role.description}</p>
                  </CardContent>
                </Card>
              </Motion.div>
            )}
          </For>
        </div>
      </div>
    </section>
  )
}

/**
 * Section 6 - Project Principles
 */
function PrinciplesSection() {
  const principles = [
    {
      icon: Globe,
      label: 'Acessibilidade',
      description: 'Informação clara para todos',
    },
    {
      icon: Shield,
      label: 'Transparência',
      description: 'Dados abertos e verificáveis',
    },
    {
      icon: Users,
      label: 'Comunidade',
      description: 'Participação coletiva',
    },
    {
      icon: Leaf,
      label: 'Sustentabilidade',
      description: 'Impacto ambiental positivo',
    },
    {
      icon: Lock,
      label: 'Privacidade',
      description: 'Respeito pelos dados pessoais',
    },
    {
      icon: Heart,
      label: 'Simplicidade',
      description: 'Experiência intuitiva',
    },
  ]

  return (
    <section class="py-24 bg-base-200">
      <div class="container mx-auto px-6">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          class="text-center mb-16"
        >
          <h2 class="text-3xl md:text-4xl font-bold text-base-content mb-4">
            Princípios do Projeto
          </h2>
          <p class="text-text-500 max-w-2xl mx-auto">
            Valores que guiam o desenvolvimento e operação da plataforma
          </p>
        </Motion.div>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <For each={principles}>
            {(principle, index) => (
              <Motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index() * 0.08 }}
                class="flex flex-col items-center text-center p-6 bg-base-100 rounded-xl border border-primary-100 hover:border-primary-300 transition-colors"
              >
                <div class="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mb-4">
                  <principle.icon class="w-6 h-6 text-primary-600" />
                </div>
                <h3 class="font-semibold text-base-content mb-1">
                  {principle.label}
                </h3>
                <p class="text-xs text-text-500">{principle.description}</p>
              </Motion.div>
            )}
          </For>
        </div>
      </div>
    </section>
  )
}

/**
 * Section 7 - Contact
 */
function ContactSection() {
  const [formState, setFormState] = createSignal<'idle' | 'success'>('idle')
  const [name, setName] = createSignal('')
  const [email, setEmail] = createSignal('')
  const [message, setMessage] = createSignal('')

  const handleSubmit = (e: Event) => {
    e.preventDefault()
    // UI-only success state
    setFormState('success')
    setName('')
    setEmail('')
    setMessage('')
  }

  return (
    <section class="py-24 bg-base-100">
      <div class="container mx-auto px-6">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          class="max-w-xl mx-auto"
        >
          <div class="text-center mb-10">
            <h2 class="text-3xl md:text-4xl font-bold text-base-content mb-4">
              Contacte-nos
            </h2>
            <p class="text-text-500">
              Tem questões ou sugestões? Adoraríamos ouvir a sua opinião.
            </p>
          </div>

          <Card class="bg-base-50 border-primary-100">
            <CardContent class="p-8">
              <Presence exitBeforeEnter>
                <Show
                  when={formState() === 'success'}
                  fallback={
                    <Motion.form
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      onSubmit={handleSubmit}
                      class="space-y-6"
                    >
                      <div class="space-y-2">
                        <Label for="name">Nome</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="O seu nome"
                          value={name()}
                          onInput={(e) => setName(e.currentTarget.value)}
                          required
                        />
                      </div>

                      <div class="space-y-2">
                        <Label for="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="email@exemplo.com"
                          value={email()}
                          onInput={(e) => setEmail(e.currentTarget.value)}
                          required
                        />
                      </div>

                      <div class="space-y-2">
                        <Label for="message">Mensagem</Label>
                        <textarea
                          id="message"
                          placeholder="A sua mensagem..."
                          value={message()}
                          onInput={(e) => setMessage(e.currentTarget.value)}
                          required
                          rows={4}
                          class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none"
                        />
                      </div>

                      <Button type="submit" class="w-full" variant="hero">
                        <MessageCircle class="w-4 h-4 mr-2" />
                        Enviar Mensagem
                      </Button>
                    </Motion.form>
                  }
                >
                  <Motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    class="text-center py-8"
                  >
                    <div class="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                      <Sparkles class="w-8 h-8 text-success" />
                    </div>
                    <h3 class="text-xl font-semibold text-base-content mb-2">
                      Mensagem Enviada!
                    </h3>
                    <p class="text-text-500 mb-6">
                      Obrigado pelo seu contacto. Responderemos em breve.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setFormState('idle')}
                    >
                      Enviar Outra Mensagem
                    </Button>
                  </Motion.div>
                </Show>
              </Presence>
            </CardContent>
          </Card>
        </Motion.div>
      </div>
    </section>
  )
}

/**
 * About page - Main component
 */
export default function About() {
  return (
    <div class="min-h-screen bg-base-100">
      <HeroSection />
      <ProblemSection />
      <ProjectSection />
      <HowItWorksSection />
      <UserRoleSection />
      <PrinciplesSection />
      <ContactSection />
    </div>
  )
}
