const localHosts = new Set(['127.0.0.1', 'localhost', '::1'])

function localOriginFor(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin) return null

  try {
    const originUrl = new URL(origin)
    const requestUrl = new URL(request.url)
    if (!localHosts.has(originUrl.hostname) || !localHosts.has(requestUrl.hostname)) return null
    return origin
  } catch {
    return null
  }
}

export function isCorsPreflight(request: Request) {
  return request.method === 'OPTIONS' && Boolean(localOriginFor(request))
}

function applyLocalCors(request: Request, headers: Headers) {
  const origin = localOriginFor(request)
  if (!origin) return headers

  headers.set('Access-Control-Allow-Origin', origin)
  headers.set('Access-Control-Allow-Methods', 'GET,POST,HEAD,OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type')
  headers.append('Vary', 'Origin')
  return headers
}

export function corsPreflightResponse(request: Request) {
  return new Response(null, {
    status: 204,
    headers: applyLocalCors(request, new Headers()),
  })
}

export function withLocalCors(request: Request, response: Response) {
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: applyLocalCors(request, new Headers(response.headers)),
  })
}
