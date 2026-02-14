import { CheckCircle2, RotateCcw, XCircle } from 'lucide-solid'
import { createSignal, For, Show } from 'solid-js'

import {
  generateQuizQuestions,
  type QuizQuestion,
} from '~/modules/guide/data/guideData'
import { useInView } from '~/modules/guide/hooks/useInView'

/**
 * Mini-Quiz component for reinforcing recycling knowledge.
 * 5 questions, local state only, with visual feedback.
 */
export function MiniQuiz() {
  const { inView, setRef } = useInView({ threshold: 0.1 })

  const [questions, setQuestions] = createSignal<QuizQuestion[]>(
    generateQuizQuestions(5),
  )
  const [currentIndex, setCurrentIndex] = createSignal(0)
  const [selectedAnswer, setSelectedAnswer] = createSignal<string | null>(null)
  const [score, setScore] = createSignal(0)
  const [answered, setAnswered] = createSignal(false)
  const [finished, setFinished] = createSignal(false)

  const currentQuestion = () => questions()[currentIndex()]
  const isCorrect = () => selectedAnswer() === currentQuestion()?.correctBin
  const progress = () =>
    Math.round(
      ((currentIndex() + (finished() ? 1 : 0)) / questions().length) * 100,
    )

  const handleAnswer = (option: string) => {
    if (answered()) return
    setSelectedAnswer(option)
    setAnswered(true)
    if (option === currentQuestion()?.correctBin) {
      setScore((s) => s + 1)
    }
  }

  const handleNext = () => {
    if (currentIndex() < questions().length - 1) {
      setCurrentIndex((i) => i + 1)
      setSelectedAnswer(null)
      setAnswered(false)
    } else {
      setFinished(true)
    }
  }

  const handleRestart = () => {
    setQuestions(generateQuizQuestions(5))
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setScore(0)
    setAnswered(false)
    setFinished(false)
  }

  const scoreMessage = () => {
    const s = score()
    const total = questions().length
    const ratio = s / total
    if (ratio === 1) return 'Perfeito! Sabes tudo sobre reciclagem. 🎉'
    if (ratio >= 0.8) return 'Excelente! Estás quase lá. 🌟'
    if (ratio >= 0.6) return 'Bom trabalho! Continua a aprender. 💪'
    return 'Não desistas! Revê o guia e tenta de novo. 📚'
  }

  return (
    <section
      ref={setRef}
      class="py-20 bg-base-200 transition-opacity duration-500"
      classList={{
        'opacity-0': !inView(),
        'opacity-100': inView(),
      }}
    >
      <div class="container mx-auto px-6">
        <div class="max-w-2xl mx-auto">
          {/* Header */}
          <div class="text-center mb-10">
            <h2 class="text-3xl md:text-4xl font-bold text-base-content mb-3">
              Testa os teus conhecimentos
            </h2>
            <p class="text-text-500">
              Onde depositar cada resíduo? Descobre se sabes separar
              corretamente.
            </p>
          </div>

          <Show
            when={!finished()}
            fallback={
              /* Results card */
              <div class="rounded-2xl bg-base-50 border border-base-300/40 shadow-md p-8 text-center space-y-6">
                <div class="text-6xl font-bold text-primary-500">
                  {score()}/{questions().length}
                </div>
                <p class="text-lg text-base-content">{scoreMessage()}</p>

                {/* Score bar */}
                <div class="w-full h-3 rounded-full bg-base-200 overflow-hidden">
                  <div
                    class="h-full rounded-full bg-primary-500 transition-all duration-700 ease-out"
                    style={{
                      width: `${(score() / questions().length) * 100}%`,
                    }}
                  />
                </div>

                <button
                  onClick={handleRestart}
                  class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 text-primary-content font-semibold hover:bg-primary-600 hover:scale-[1.02] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                >
                  <RotateCcw class="w-4 h-4" />
                  Tentar de Novo
                </button>
              </div>
            }
          >
            {/* Question card */}
            <div class="rounded-2xl bg-base-50 border border-base-300/40 shadow-md overflow-hidden">
              {/* Progress bar */}
              <div class="h-1.5 bg-base-200">
                <div
                  class="h-full bg-primary-400 transition-all duration-500 ease-out"
                  style={{ width: `${progress()}%` }}
                />
              </div>

              <div class="p-6 md:p-8 space-y-6">
                {/* Question counter */}
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-text-500">
                    Pergunta {currentIndex() + 1} de {questions().length}
                  </span>
                  <span class="text-sm font-medium text-primary-500">
                    {score()} corretas
                  </span>
                </div>

                {/* Question */}
                <div class="text-center py-4">
                  <p class="text-sm text-text-500 mb-2">
                    Onde depositar este resíduo?
                  </p>
                  <p class="text-xl md:text-2xl font-bold text-base-content">
                    {currentQuestion()?.item}
                  </p>
                </div>

                {/* Options */}
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <For each={currentQuestion()?.options ?? []}>
                    {(option) => {
                      const isSelected = () => selectedAnswer() === option
                      const isOptionCorrect = () =>
                        option === currentQuestion()?.correctBin
                      const showResult = () => answered()

                      return (
                        <button
                          onClick={() => handleAnswer(option)}
                          disabled={answered()}
                          class="relative flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                          classList={{
                            'border-success bg-success/10 text-success':
                              showResult() && isOptionCorrect(),
                            'border-error bg-error/10 text-error animate-[shake_0.3s_ease-in-out]':
                              showResult() &&
                              isSelected() &&
                              !isOptionCorrect(),
                            'border-base-300 hover:border-primary-300 hover:bg-primary-50 text-base-content':
                              !showResult(),
                            'border-base-300/60 text-base-content/50':
                              showResult() &&
                              !isSelected() &&
                              !isOptionCorrect(),
                          }}
                        >
                          <span class="text-sm">{option}</span>
                          <Show when={showResult() && isOptionCorrect()}>
                            <CheckCircle2 class="w-5 h-5 ml-auto shrink-0 text-success" />
                          </Show>
                          <Show
                            when={
                              showResult() && isSelected() && !isOptionCorrect()
                            }
                          >
                            <XCircle class="w-5 h-5 ml-auto shrink-0 text-error" />
                          </Show>
                        </button>
                      )
                    }}
                  </For>
                </div>

                {/* Feedback + Next */}
                <Show when={answered()}>
                  <div class="flex items-center justify-between pt-2">
                    <p
                      class="text-sm font-medium"
                      classList={{
                        'text-success': isCorrect(),
                        'text-error': !isCorrect(),
                      }}
                    >
                      {isCorrect()
                        ? 'Correto! Boa resposta. ✓'
                        : `Vai para: ${currentQuestion()?.correctBin}`}
                    </p>
                    <button
                      onClick={handleNext}
                      class="px-5 py-2 rounded-lg bg-primary-500 text-primary-content text-sm font-semibold hover:bg-primary-600 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                    >
                      {currentIndex() < questions().length - 1
                        ? 'Próxima'
                        : 'Ver Resultado'}
                    </button>
                  </div>
                </Show>
              </div>
            </div>
          </Show>
        </div>
      </div>
    </section>
  )
}
