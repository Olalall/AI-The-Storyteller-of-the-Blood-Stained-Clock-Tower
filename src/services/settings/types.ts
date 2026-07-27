export type AIProviderMode = 'off' | 'backend' | 'openai-compatible'

export interface AISettings {
  mode: AIProviderMode
  model: string
  baseUrl: string
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
