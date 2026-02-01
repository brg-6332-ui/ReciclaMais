import { createEffect, createSignal, onMount } from 'solid-js'

export default function TestGPS() {
  const [gpsPositions, setGpsPositions] = createSignal<
    Record<string, unknown>[]
  >([])

  const [time, setTime] = createSignal(new Date())
  const [tick, setTick] = createSignal(0)

  createEffect(() => {
    let backendUrl = 'http://localhost:3000/api/test-gps'
    if (import.meta.env.PROD) {
      backendUrl = 'https://your-production-backend.com/api/test-gps'
    }

    tick()

    fetch(backendUrl)
      .then((response) => response.json())
      .then((data) => {
        setGpsPositions(data)
      })
      .catch((error) => {
        console.error('Error fetching GPS positions:', error)
      })
  })

  onMount(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1)
      setTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  })

  return (
    <div class="min-h-screen py-12">
      <div class="container mx-auto px-4">
        <div class="mb-12 text-center">
          <h1 class="text-4xl md:text-5xl font-bold mb-4">
            Test GPS Positions
          </h1>
          <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
            Displaying fetched GPS positions from the backend
          </p>
        </div>

        <div>
          <h2 class="text-2xl font-semibold mb-4">Fetched GPS Positions:</h2>
          <ul class="list-disc list-inside">
            {time().toISOString().replace('T', ' ').replace('Z', '')}
            <pre>{JSON.stringify(gpsPositions(), null, 2)}</pre>
          </ul>
        </div>
      </div>
    </div>
  )
}
