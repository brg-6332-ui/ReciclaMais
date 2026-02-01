import { CrosshairIcon, Loader2, Maximize, Minimize } from 'lucide-solid'
import { Accessor, createMemo, createSignal, Setter, Show } from 'solid-js'

import { Card } from '~/components/ui/card'
import { SearchPill } from '~/modules/common/sections/SearchPill/SearchPill'
import { useGeolocation } from '~/modules/map/hooks/useGeolocation'
import { CollectionPointsMap } from '~/modules/map/sections/CollectionPointsMap'
import { cn } from '~/utils/cn'

interface MapContainerProps {
  placeId: Accessor<string | null>
  search: Accessor<string | null>
  userLat: Accessor<number | null>
  userLng: Accessor<number | null>
  isFullscreen: Accessor<boolean>
  onSearchChange: Setter<string | null>
  onPlaceSelected: Setter<string | null>
  onLocationSelect: (lat: number, lng: number) => void
  onFullscreenToggle: Setter<boolean>
}

/**
 * Container component for the collection points map.
 * Includes fullscreen toggle and search overlay functionality.
 */
export function MapContainer(props: MapContainerProps) {
  const isFullscreen = createMemo(() => props.isFullscreen())
  const [locError, setLocError] = createSignal<string | null>(null)
  // reference to the card element for Fullscreen API
  const [cardRef, setCardRef] = createSignal<HTMLElement | null>(null)
  // Show the pulsing hint until the user interacts with a FAB once.
  // Persist in localStorage so it doesn't reappear on reloads.
  const storageKey = 'reciclamais.fabPulseSeen'
  let initialPulse = true
  if (typeof window !== 'undefined') {
    try {
      initialPulse = window.localStorage.getItem(storageKey) !== '1'
    } catch {
      initialPulse = true
    }
  }
  const [showPulse, setShowPulse] = createSignal(initialPulse)

  const handleToggleFullscreen = async () => {
    // mark that user interacted with FABs so the pulse hint stops
    if (showPulse()) {
      setShowPulse(false)
      try {
        if (typeof window !== 'undefined')
          window.localStorage.setItem(storageKey, '1')
      } catch {
        /* ignore */
      }
    }

    const next = !isFullscreen()
    if (next) {
      try {
        await cardRef()?.requestFullscreen?.()
      } catch (err) {
        // fallback: still toggle CSS fullscreen even if Fullscreen API fails
        console.warn('requestFullscreen failed', err)
      }
    } else {
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen?.()
        } catch (err) {
          console.warn('exitFullscreen failed', err)
        }
      }
    }

    // Update parent fullscreen state
    props.onFullscreenToggle(next)
  }

  const {
    getCurrentPosition,
    loading: geoLoading,
    isSupported,
  } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 15000,
    onSuccess: (position) => {
      props.onLocationSelect(position.lat, position.lng)
      setLocError(null)
      // after successful locate, enter fullscreen like the fullscreen button
      if (!isFullscreen()) {
        void handleToggleFullscreen()
      }
    },
    onError: (err) => {
      console.error('Geolocation error', err)
      switch (err.code) {
        case err.PERMISSION_DENIED:
        case 1:
          setLocError(
            'Permissão negada para aceder à localização. Ative-a nas definições do navegador.',
          )
          break
        case err.POSITION_UNAVAILABLE:
        case 2:
          setLocError(
            'Posição indisponível. Verifique o sinal GPS ou tente novamente.',
          )
          break
        case err.TIMEOUT:
        case 3:
          setLocError(
            'Tempo esgotado ao obter localização. Verifique o sinal GPS ou tente novamente.',
          )
          break
        default:
          setLocError('Não foi possível obter a localização')
      }
    },
  })

  const locateUser = () => {
    setLocError(null)
    if (!isSupported) {
      setLocError('Geolocalização não suportada no dispositivo')
      return
    }
    // mark that user interacted with FABs so the pulse hint stops
    if (showPulse()) {
      setShowPulse(false)
      try {
        if (typeof window !== 'undefined')
          window.localStorage.setItem(storageKey, '1')
      } catch {
        /* ignore */
      }
    }
    getCurrentPosition()
  }

  return (
    <Card
      ref={setCardRef}
      class={cn(
        'mb-8 shadow-lg overflow-hidden h-[200px] md:h-[400px] transition-all duration-300 ease-in-out relative',
        {
          'h-screen md:h-screen w-screen fixed inset-0 rounded-none z-50':
            isFullscreen(),
        },
      )}
    >
      {/* Toggle fullscreen button (overlay on right) - hidden on small screens (mobile uses FAB) */}
      <div class="absolute top-3 right-3 z-60 hidden md:block">
        <button
          class="inline-flex items-center gap-2 rounded-md bg-base-50/80 px-2 py-1 text-sm shadow hover:brightness-95 transition"
          onClick={() => void handleToggleFullscreen()}
          aria-pressed={isFullscreen()}
          aria-label={isFullscreen() ? 'Exit fullscreen' : 'Open fullscreen'}
        >
          {isFullscreen() ? (
            <Minimize class="h-4 w-4" />
          ) : (
            <Maximize class="h-4 w-4" />
          )}
          <span class="hidden sm:inline">
            {isFullscreen() ? 'Close' : 'Fullscreen'}
          </span>
        </button>
      </div>

      <Show when={isFullscreen()}>
        {/* Search bar: on larger screens keep it at the left; on small screens center it */}
        <div class="absolute top-3 left-3 z-60 hidden md:block">
          <SearchPill
            onPlaceSelected={props.onPlaceSelected}
            onUseLocationClick={props.onLocationSelect}
          />
        </div>

        <div class="absolute top-3 left-0 right-0 z-60 md:hidden flex justify-center px-4">
          <SearchPill
            onSearch={props.onSearchChange}
            onPlaceSelected={props.onPlaceSelected}
            onUseLocationClick={props.onLocationSelect}
          />
        </div>
      </Show>

      <CollectionPointsMap
        placeId={props.placeId()}
        search={props.search()}
        lat={props.userLat()}
        lng={props.userLng()}
      />

      {/* Mobile FABs: locate + fullscreen toggle */}
      <div
        class={cn(
          'fixed right-4 bottom-20 z-60 flex flex-col gap-3 md:hidden',
          { 'animate-pulse': showPulse() },
        )}
      >
        <button
          class="bg-base-50 border border-primary-950 text-primary-700 p-3 rounded-full shadow-md flex items-center justify-center"
          onClick={locateUser}
          aria-label="Localizar-me"
          aria-busy={geoLoading()}
          disabled={geoLoading()}
        >
          <Show
            when={geoLoading()}
            fallback={<CrosshairIcon class="h-5 w-5" />}
          >
            <Loader2 class="h-5 w-5 animate-spin" />
          </Show>
        </button>
        <button
          class="bg-base-50 border border-primary-950 text-primary-700 p-3 rounded-full shadow-md flex items-center justify-center"
          onClick={() => void handleToggleFullscreen()}
          aria-pressed={isFullscreen()}
          aria-label={
            isFullscreen() ? 'Fechar em ecrã inteiro' : 'Abrir em ecrã inteiro'
          }
        >
          {isFullscreen() ? (
            <Minimize class="h-5 w-5" />
          ) : (
            <Maximize class="h-5 w-5" />
          )}
        </button>
      </div>

      <Show when={locError()}>
        <div class="fixed left-4 bottom-6 z-60 bg-red-600 text-white px-3 py-2 rounded-md shadow-md text-sm flex items-center gap-3">
          <div class="min-w-0">{locError()}</div>
          <div class="flex items-center gap-2">
            <button
              class="bg-white text-red-600 px-2 py-1 rounded text-sm font-medium"
              onClick={locateUser}
            >
              Tentar novamente
            </button>
            <button
              class="text-white/80 px-2 py-1 rounded text-sm"
              onClick={() => setLocError(null)}
            >
              Fechar
            </button>
          </div>
        </div>
      </Show>
    </Card>
  )
}
