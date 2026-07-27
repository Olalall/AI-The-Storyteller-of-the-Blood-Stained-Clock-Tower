export type AIProviderErrorCode =
  | 'BAD_REQUEST'
  | 'AI_PROVIDER_DISABLED'
  | 'AI_PROVIDER_UNCONFIGURED'
  | 'AI_PROVIDER_TIMEOUT'
  | 'AI_PROVIDER_RATE_LIMITED'
  | 'AI_PROVIDER_BAD_RESPONSE'
  | 'AI_PROVIDER_UNAVAILABLE'

export interface AIProviderApiErrorBody {
  accepted: false
  error: {
    code: AIProviderErrorCode
    message: string
  }
}

const errorMessages: Record<AIProviderErrorCode, string> = {
  BAD_REQUEST: '请求字段缺失或格式错误',
  AI_PROVIDER_DISABLED: 'AI provider 未启用',
  AI_PROVIDER_UNCONFIGURED: 'AI provider 配置不完整',
  AI_PROVIDER_TIMEOUT: 'AI provider 请求超时',
  AI_PROVIDER_RATE_LIMITED: 'AI provider 已限流',
  AI_PROVIDER_BAD_RESPONSE: 'AI provider 返回格式异常',
  AI_PROVIDER_UNAVAILABLE: 'AI provider 暂不可用',
}

export function aiErrorMessage(code: AIProviderErrorCode) {
  return errorMessages[code]
}

export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function aiApiError(code: AIProviderErrorCode, status: number, message = aiErrorMessage(code)) {
  return json({ accepted: false, error: { code, message } } satisfies AIProviderApiErrorBody, status)
}
