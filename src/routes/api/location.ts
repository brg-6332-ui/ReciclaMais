import { getLegacyLocationController } from '~/modules/collection-network/interface/http/collection-network.controller'

export async function POST(request: Request) {
  try {
    const requestLike = request as unknown as { json?: () => Promise<unknown> }
    const rawBody: unknown =
      typeof requestLike.json === 'function'
        ? await requestLike.json.call(request)
        : (JSON.parse(await request.text()) as unknown)

    if (typeof rawBody !== 'object' || rawBody === null) {
      return new Response(
        JSON.stringify({ status: 'error', message: 'Invalid request body' }),
        { status: 400 },
      )
    }

    const body = rawBody as Record<string, unknown>

    const latitude =
      typeof body.latitude === 'number'
        ? body.latitude
        : typeof body.latitude === 'string'
          ? Number(body.latitude)
          : NaN

    const longitude =
      typeof body.longitude === 'number'
        ? body.longitude
        : typeof body.longitude === 'string'
          ? Number(body.longitude)
          : NaN

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return new Response(
        JSON.stringify({ status: 'error', message: 'Invalid coordinates' }),
        { status: 400 },
      )
    }

    return new Response(JSON.stringify({ status: 'success' }), { status: 200 })
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500 },
    )
  }
}

export async function GET() {
  return await getLegacyLocationController()
}
