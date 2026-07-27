import type { AIProviderApiErrorBody, AIProviderErrorCode } from './aiErrors'
import type { AIProviderChatMessage } from './types'

export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

export interface OpenAICompatibleClientSettings {
  baseUrl: string
  model: string
  apiKey: string
  timeoutSeconds: number
  fetcher?: FetchLike
}

export class AIProviderError extends Error {
  readonly code: AIProviderErrorCode
  readonly status: number

  constructor(code: AIProviderErrorCode, status: number, message = code) {
    super(message)
    this.name = 'AIProviderError'
    this.code = code
    this.status = status
  }
}

function endpointFor(baseUrl: string) {
  return `${baseUrl.replace(/\/$/, '')}/chat/completions`
}

function statusCodeFor(code: AIProviderErrorCode) {
  if (code === 'AI_PROVIDER_TIMEOUT') return 504
  if (code === 'AI_PROVIDER_RATE_LIMITED') return 429
  if (code === 'AI_PROVIDER_BAD_RESPONSE') return 502
  if (code === 'AI_PROVIDER_UNAVAILABLE') return 503
  return 400
}

function codeForStatus(status: number): AIProviderErrorCode {
  if (status === 429) return 'AI_PROVIDER_RATE_LIMITED'
  if (status >= 500) return 'AI_PROVIDER_UNAVAILABLE'
  if (status === 401 || status === 403) return 'AI_PROVIDER_UNCONFIGURED'
  return 'AI_PROVIDER_BAD_RESPONSE'
}

function providerError(code: AIProviderErrorCode, message?: string) {
  return new AIProviderError(code, statusCodeFor(code), message ?? code)
}

function debugProviderResponse(message: string) {
  if (typeof process !== 'undefined' && process.env.BOTC_AI_DEBUG === '1') {
    console.warn(`[botc-ai] provider response parse detail: ${message.slice(0, 1200)}`)
  }
}

async function parseJson(response: Response) {
  try {
    return await response.json() as unknown
  } catch {
    debugProviderResponse('provider HTTP response was not JSON')
    throw providerError('AI_PROVIDER_BAD_RESPONSE')
  }
}

function contentFrom(body: unknown) {
  const candidate = body as { choices?: Array<{ message?: { content?: unknown } }> } | null
  const content = candidate?.choices?.[0]?.message?.content
  if (typeof content !== 'string' || !content.trim()) {
    debugProviderResponse(JSON.stringify(body).slice(0, 1200))
    throw providerError('AI_PROVIDER_BAD_RESPONSE')
  }
  return content
}

function parseJSONContent<T>(content: string): T {
  try {
    return JSON.parse(content) as T
  } catch {
    const start = content.indexOf('{')
    const end = content.lastIndexOf('}')
    if (start < 0 || end <= start) {
      debugProviderResponse(content)
      throw providerError('AI_PROVIDER_BAD_RESPONSE')
    }
    try {
      return JSON.parse(content.slice(start, end + 1)) as T
    } catch {
      debugProviderResponse(content)
      throw providerError('AI_PROVIDER_BAD_RESPONSE')
    }
  }
}

export async function callOpenAICompatibleJSON<T>(
  settings: OpenAICompatibleClientSettings,
  messages: AIProviderChatMessage[],
): Promise<T> {
  const fetcher = settings.fetcher ?? fetch
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), Math.max(1, settings.timeoutSeconds) * 1000)

  try {
    const response = await fetcher(endpointFor(settings.baseUrl), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.model,
        messages,
        temperature: 0.2,
        max_tokens: 3000,
        thinking: { type: 'disabled' },
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      try {
        debugProviderResponse(`HTTP ${response.status}: ${await response.clone().text()}`)
      } catch {
        debugProviderResponse(`HTTP ${response.status}`)
      }
      throw new AIProviderError(codeForStatus(response.status), response.status)
    }
    const content = contentFrom(await parseJson(response))
    return parseJSONContent<T>(content)
  } catch (error) {
    if (error instanceof AIProviderError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw providerError('AI_PROVIDER_TIMEOUT')
    }
    throw providerError('AI_PROVIDER_UNAVAILABLE')
  } finally {
    clearTimeout(timeoutId)
  }
}

export function aiProviderErrorBody(error: AIProviderError): AIProviderApiErrorBody {
  return {
    accepted: false,
    error: {
      code: error.code,
      message: error.message,
    },
  }
}
