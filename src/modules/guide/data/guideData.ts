import {
  Battery,
  FileText,
  GlassWater,
  Package,
  Recycle,
  Trash2,
} from 'lucide-solid'
import type { Component } from 'solid-js'

/** Bin color identifiers used for visual styling */
export type BinColor = 'blue' | 'yellow' | 'green' | 'brown' | 'gray' | 'red'

/** A single recycling guide category */
export interface GuideCategory {
  id: string
  title: string
  binColor: BinColor
  binLabel: string
  icon: Component<{ class?: string }>
  canRecycle: string[]
  cannotRecycle: string[]
  tips: string[]
  commonMistakes: string[]
  impactFacts: string[]
}

/** A quiz question generated from the guide data */
export interface QuizQuestion {
  id: number
  item: string
  correctBin: string
  options: string[]
}

/**
 * Tailwind class map for bin colors — background, text, border and chip styles
 */
export const BIN_COLOR_STYLES: Record<
  BinColor,
  {
    bg: string
    bgLight: string
    text: string
    border: string
    chip: string
    ring: string
  }
> = {
  blue: {
    bg: 'bg-plastic',
    bgLight: 'bg-plastic-bg',
    text: 'text-plastic',
    border: 'border-plastic-border',
    chip: 'bg-plastic/15 text-plastic',
    ring: 'ring-plastic/30',
  },
  yellow: {
    bg: 'bg-paper',
    bgLight: 'bg-paper-bg',
    text: 'text-paper',
    border: 'border-paper-border',
    chip: 'bg-paper/15 text-paper',
    ring: 'ring-paper/30',
  },
  green: {
    bg: 'bg-glass',
    bgLight: 'bg-glass-bg',
    text: 'text-glass',
    border: 'border-glass-border',
    chip: 'bg-glass/15 text-glass',
    ring: 'ring-glass/30',
  },
  brown: {
    bg: 'bg-warning',
    bgLight: 'bg-warning/10',
    text: 'text-warning',
    border: 'border-warning/30',
    chip: 'bg-warning/15 text-warning',
    ring: 'ring-warning/30',
  },
  gray: {
    bg: 'bg-metal',
    bgLight: 'bg-metal-bg',
    text: 'text-metal',
    border: 'border-metal-border',
    chip: 'bg-metal/15 text-metal',
    ring: 'ring-metal/30',
  },
  red: {
    bg: 'bg-error',
    bgLight: 'bg-error/10',
    text: 'text-error',
    border: 'border-error/30',
    chip: 'bg-error/15 text-error',
    ring: 'ring-error/30',
  },
}

/**
 * Static guide categories — didactic content for the recycling guide page.
 * Content is adapted for the Portuguese recycling context (Braga / Portugal).
 */
export const GUIDE_CATEGORIES: GuideCategory[] = [
  {
    id: 'paper',
    title: 'Papel e Cartão',
    binColor: 'blue',
    binLabel: 'Ecoponto Azul',
    icon: FileText,
    canRecycle: [
      'Jornais e revistas',
      'Caixas de cartão (dobradas)',
      'Papel de escritório e cadernos',
      'Sacos de papel',
      'Embalagens de cartão (cereais, bolachas)',
      'Cartolinas e envelopes',
    ],
    cannotRecycle: [
      'Papel plastificado ou encerado',
      'Papel de cozinha e guardanapos usados',
      'Fraldas e produtos de higiene',
      'Papel químico (talões antigos)',
      'Papel com gordura ou restos de comida',
    ],
    tips: [
      'Dobre as caixas de cartão para poupar espaço no contentor.',
      'Retire fitas adesivas e plásticos das embalagens de cartão.',
      'Não amasse — papel liso é mais fácil de reciclar.',
      'Separe os diferentes tipos de papel quando possível.',
    ],
    commonMistakes: [
      'Colocar caixas de pizza sujas no ecoponto azul — devem ir para o lixo comum.',
      'Misturar papel com guardanapos usados ou lenços.',
      'Depositar embalagens Tetra Pak no azul — vão para o amarelo.',
      'Incluir papel fotográfico — este não é reciclável.',
    ],
    impactFacts: [
      'Reciclar papel poupa água e energia na produção de pasta de celulose.',
      'Cada tonelada de papel reciclado evita o abate de várias árvores.',
    ],
  },
  {
    id: 'plastic',
    title: 'Plástico e Embalagens',
    binColor: 'yellow',
    binLabel: 'Ecoponto Amarelo',
    icon: Package,
    canRecycle: [
      'Garrafas de água e refrigerantes (PET)',
      'Embalagens de detergentes e champôs',
      'Sacos e películas de plástico',
      'Embalagens Tetra Pak (leite, sumos)',
      'Iogurtes e embalagens de manteiga',
      'Latas de conservas e bebidas',
    ],
    cannotRecycle: [
      'Brinquedos de plástico',
      'Eletrodomésticos ou peças de plástico rígido',
      'Embalagens com restos de comida (sem enxaguar)',
      'Cabides e utensílios de cozinha',
      'Esferovite suja ou com resíduos',
    ],
    tips: [
      'Enxague as embalagens antes de depositar — basta uma passagem rápida.',
      'Esmague as garrafas para reduzir volume — mas deixe a tampa.',
      'As embalagens Tetra Pak podem ser espalmadas para poupar espaço.',
      'Na dúvida, verifique o símbolo de reciclagem na embalagem.',
    ],
    commonMistakes: [
      'Colocar esferovite suja no amarelo — se estiver limpa, pode ir.',
      'Depositar talheres ou utensílios de plástico — não são embalagens.',
      'Esquecer de enxaguar embalagens com gordura ou restos.',
      'Confundir plástico rígido (balde, caixas) com embalagens.',
    ],
    impactFacts: [
      'Reciclar plástico consome significativamente menos energia do que produzir plástico virgem.',
      'A reciclagem de embalagens reduz a quantidade de resíduos em aterro.',
    ],
  },
  {
    id: 'glass',
    title: 'Vidro',
    binColor: 'green',
    binLabel: 'Ecoponto Verde',
    icon: GlassWater,
    canRecycle: [
      'Garrafas de bebidas (vinho, cerveja, sumos)',
      'Frascos de conservas e doces',
      'Boiões e frascos de vidro',
      'Garrafões de vidro',
    ],
    cannotRecycle: [
      'Espelhos e vidros de janelas',
      'Louças, cerâmicas e porcelanas',
      'Lâmpadas (vão para pontos específicos)',
      'Cristal e vidro temperado',
      'Vidros de óculos',
    ],
    tips: [
      'Retire tampas metálicas ou de plástico — vão para o amarelo.',
      'Não é preciso remover rótulos de papel.',
      'Deposite com cuidado para não partir outros vidros.',
      'Vidro pode ser reciclado infinitas vezes sem perder qualidade.',
    ],
    commonMistakes: [
      'Colocar cerâmica ou porcelana no vidrão — contamina o processo.',
      'Depositar espelhos ou vidros planos — composição diferente.',
      'Incluir lâmpadas — devem ir para pontos de recolha especiais.',
      'Misturar pirex ou vidro temperado com vidro comum.',
    ],
    impactFacts: [
      'O vidro é 100% reciclável e pode ser reutilizado indefinidamente.',
      'Reciclar vidro reduz significativamente as emissões na sua produção.',
    ],
  },
  {
    id: 'metal',
    title: 'Metal',
    binColor: 'gray',
    binLabel: 'Ecoponto Amarelo',
    icon: Recycle,
    canRecycle: [
      'Latas de bebidas (alumínio)',
      'Latas de conservas',
      'Aerossóis vazios',
      'Papel de alumínio limpo',
      'Tampas metálicas',
      'Tabuleiros de alumínio',
    ],
    cannotRecycle: [
      'Latas de tinta ou produtos químicos',
      'Pilhas e baterias (recolha específica)',
      'Panelas, tachos e utensílios de cozinha',
      'Ferramentas e peças metálicas',
      'Eletrodomésticos',
    ],
    tips: [
      'Esmague as latas para poupar espaço no contentor.',
      'Enxague as latas de conserva antes de depositar.',
      'Aerossóis devem estar completamente vazios.',
      'Metais vão para o ecoponto amarelo, junto com plásticos.',
    ],
    commonMistakes: [
      'Depositar pilhas no ecoponto — devem ir para pilhões.',
      'Colocar talheres ou panelas no amarelo — não são embalagens.',
      'Incluir latas de tinta — são resíduos perigosos.',
      'Esquecer que tampas metálicas de frascos de vidro vão para o amarelo.',
    ],
    impactFacts: [
      'O alumínio reciclado poupa até 95% da energia necessária para produzir alumínio novo.',
      'Uma lata reciclada pode voltar a ser uma lata nova em poucas semanas.',
    ],
  },
  {
    id: 'organic',
    title: 'Orgânico',
    binColor: 'brown',
    binLabel: 'Contentor Castanho',
    icon: Trash2,
    canRecycle: [
      'Restos de frutas e legumes',
      'Cascas de ovos',
      'Borras de café e saquetas de chá',
      'Restos de comida cozinhada',
      'Guardanapos e papel de cozinha sujos',
      'Pequenos restos de jardim (folhas, ervas)',
    ],
    cannotRecycle: [
      'Óleos de cozinha (recolha específica)',
      'Cinzas de lareira ou churrasqueira',
      'Excrementos de animais',
      'Madeira tratada ou pintada',
      'Medicamentos (ir à farmácia)',
    ],
    tips: [
      'Use um balde com tampa em casa para recolher orgânicos.',
      'Quanto mais pequenos os restos, mais rápido se decompõem.',
      'Evite líquidos em excesso no contentor.',
      'Estes resíduos podem virar composto para agricultura e jardins.',
    ],
    commonMistakes: [
      'Colocar óleos alimentares no contentor orgânico — devem ser levados a oleões.',
      'Incluir embalagens biodegradáveis que não são compostáveis.',
      'Misturar com plásticos ou metais por engano.',
      'Depositar grandes quantidades de erva ou ramos — ir ao ecocentro.',
    ],
    impactFacts: [
      'Resíduos orgânicos em aterro geram metano, um gás com grande efeito de estufa.',
      'A compostagem transforma restos em adubo natural, fechando o ciclo.',
    ],
  },
  {
    id: 'special',
    title: 'Resíduos Especiais',
    binColor: 'red',
    binLabel: 'Pontos de Recolha Específicos',
    icon: Battery,
    canRecycle: [
      'Pilhas e baterias (pilhões)',
      'Lâmpadas (lojas e ecocentros)',
      'Equipamentos eletrónicos (REEE)',
      'Óleos alimentares usados (oleões)',
      'Medicamentos fora de validade (farmácias)',
      'Radiografias e tinteiros (pontos específicos)',
    ],
    cannotRecycle: [
      'Não depositar em ecopontos comuns',
      'Não misturar pilhas com lixo doméstico',
      'Não deitar óleos pelo ralo ou sanita',
      'Não colocar eletrónicos no lixo indiferenciado',
    ],
    tips: [
      'Muitas lojas de eletrónica aceitam equipamentos antigos.',
      'As farmácias têm pontos VALORMED para medicamentos.',
      'Procure pilhões em supermercados e espaços públicos.',
      'Leve óleos usados a oleões — estão disponíveis em vários locais.',
    ],
    commonMistakes: [
      'Deitar pilhas no lixo comum — são resíduos perigosos.',
      'Colocar lâmpadas no vidrão — têm componentes tóxicos.',
      'Descartar óleos pelo ralo — polui as águas.',
      'Atirar telemóveis antigos para o lixo — contêm materiais valiosos.',
    ],
    impactFacts: [
      'Pilhas e baterias contêm metais pesados que contaminam solos e águas.',
      'A recolha correta de eletrónicos permite recuperar materiais raros e valiosos.',
    ],
  },
]

/**
 * Generates quiz questions from the guide categories.
 * Picks random items from canRecycle/cannotRecycle to create
 * "Which bin does this go in?" questions.
 */
export function generateQuizQuestions(count = 5): QuizQuestion[] {
  const allBinLabels = [...new Set(GUIDE_CATEGORIES.map((c) => c.binLabel))]

  const questions: QuizQuestion[] = []
  const usedItems = new Set<string>()

  // Collect recyclable items with their bin
  const pool: { item: string; bin: string; categoryId: string }[] = []
  for (const cat of GUIDE_CATEGORIES) {
    for (const item of cat.canRecycle) {
      pool.push({ item, bin: cat.binLabel, categoryId: cat.id })
    }
  }

  // Shuffle the pool
  const shuffled = [...pool].sort(() => Math.random() - 0.5)

  for (const entry of shuffled) {
    if (questions.length >= count) break
    if (usedItems.has(entry.item)) continue
    usedItems.add(entry.item)

    // Build options: correct + 2-3 wrong ones
    const wrongOptions = allBinLabels
      .filter((b) => b !== entry.bin)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)

    const options = [entry.bin, ...wrongOptions].sort(() => Math.random() - 0.5)

    questions.push({
      id: questions.length + 1,
      item: entry.item,
      correctBin: entry.bin,
      options,
    })
  }

  return questions
}
