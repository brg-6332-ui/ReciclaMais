/**
 * Small helper to consistently parse JSON from the incoming Request object.
 *
 * Some dev runtimes pass a Request-like object that does not implement
 * request.json(), so this helper first attempts to use request.json() when
 * available, and otherwise falls back to request.text() + JSON.parse.
 *
 * This centralizes the compatibility logic so route handlers stay simple.
 */
export async function parseJsonRequest(request: Request): Promise<unknown> {
  const r = request as unknown as { json?: () => Promise<unknown> }
  if (typeof r.json === 'function') {
    return await (r.json as () => Promise<unknown>).call(request)
  }
  const txt = await request.text()
  if (!txt) return {}
  return JSON.parse(txt)
}
