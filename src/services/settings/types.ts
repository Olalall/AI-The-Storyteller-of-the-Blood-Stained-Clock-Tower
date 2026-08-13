export type AIProviderMode = 'off' | 'backend' | 'openai-compatible'

export interface AISettings {
  mode: AIProviderMode
  model: string
  baseUrl: string
  /** 仅保存在当前浏览器，用于兼容接口模式的后续 AI 请求。 */
  apiKey?: string
  timeoutSeconds: number
  maxContextTokens: number
  streaming: boolean
}

export const defaultAISettings: AISettings = {
  mode: 'off',
  model: 'gpt-4.1-mini',
  baseUrl: '/api/ai',
  timeoutSeconds: 30,
  maxContextTokens: 12000,
  streaming: false,
}
