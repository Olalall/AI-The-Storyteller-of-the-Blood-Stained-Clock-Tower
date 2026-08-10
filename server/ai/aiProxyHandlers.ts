import { AIProviderError, type FetchLike } from './aiProviderClient'
import { isAIProviderConfigured, publicAISettingsFrom, readAIProviderPrivateSettings } from './aiProviderSettings'
import { liveSettingsFrom, runOpenAICompatibleLiveTest } from './liveTestProvider'
import { createOpenAICompatibleNightSettlementProvider, fallbackNightSettlementAdviceDraft } from './nightSettlementProvider'
import { createOpenAICompatibleSetupAdviceProvider, fallbackSetupAdviceDraft } from './setupAdviceProvider'
import { createOpenAICompatibleReviewDraftProvider } from './reviewDraftProvider'
import { generateFakeReviewDraft } from '../archive/reviewDraft'
import type { GameArchiveRecord } from '../../src/services/archive/types'
import type {
  AISettingsLiveTestRequest,
  AISettingsLiveTestResult,
  AISettingsTestResult,
  NightSettlementAdviceDraft,
  NightSettlementProviderRequest,
  SetupAdviceDraft,
  SetupAdviceProviderRequest,
  ClientAIProviderSettings,
} from './types'

export interface AIProxyHandlerOptions {
  env?: NodeJS.ProcessEnv
  fetcher?: FetchLike
}

function logAIProviderFailure(env: NodeJS.ProcessEnv, scope: string, error: unknown) {
  if (env.BOTC_AI_DEBUG !== '1') return
  if (error instanceof AIProviderError) {
    console.warn(`[botc-ai] ${scope} failed: ${error.code} ${error.status}`)
    return
  }
  console.warn(`[botc-ai] ${scope} failed`)
}

function settingsFromClientProvider(clientProvider: ClientAIProviderSettings | undefined, env: NodeJS.ProcessEnv) {
  if (!clientProvider) return readAIProviderPrivateSettings(env)
  return {
    ...readAIProviderPrivateSettings(env),
    mode: 'backend_proxy' as const,
    provider: 'openai-compatible' as const,
    baseUrl: clientProvider.baseUrl,
    model: clientProvider.model,
    timeoutSeconds: clientProvider.timeoutSeconds,
    apiKeyConfigured: Boolean(clientProvider.apiKey),
    enabled: true,
    apiKey: clientProvider.apiKey,
  }
}

export function createAIProxyHandlers(options: AIProxyHandlerOptions = {}) {
  const env = options.env ?? process.env

  return {
    getPublicSettings() {
      return publicAISettingsFrom(readAIProviderPrivateSettings(env))
    },

    testProviderSettings(): AISettingsTestResult {
      const settings = readAIProviderPrivateSettings(env)
      if (!settings.enabled) {
        return {
          ok: false,
          provider: 'fake',
          code: 'AI_PROVIDER_DISABLED',
          message: 'AI 未启用，当前继续使用本地草稿。',
        }
      }
      if (!isAIProviderConfigured(settings)) {
        return {
          ok: false,
          provider: settings.provider,
          model: settings.model,
          code: 'AI_PROVIDER_UNCONFIGURED',
          message: 'AI 配置不完整，未发起模型调用。',
        }
      }
      return {
        ok: true,
        provider: settings.provider,
        model: settings.model,
        code: 'AI_PROVIDER_READY',
        message: 'AI 后端配置已就绪；本次只检查配置，未调用模型。',
      }
    },

    async liveTestProviderSettings(input?: AISettingsLiveTestRequest): Promise<AISettingsLiveTestResult> {
      const privateSettings = readAIProviderPrivateSettings(env)
      const settings = liveSettingsFrom(input, {
        provider: privateSettings.provider,
        baseUrl: privateSettings.baseUrl,
        model: privateSettings.model,
        apiKey: privateSettings.apiKey,
        timeoutSeconds: privateSettings.timeoutSeconds,
      })

      if (settings.provider !== 'openai-compatible' || !settings.baseUrl || !settings.model || !settings.apiKey) {
        return {
          ok: false,
          provider: settings.provider,
          model: settings.model,
          code: 'AI_PROVIDER_UNCONFIGURED',
          message: '缺少接入地址、模型或 API KEY，未调用模型。',
        }
      }

      try {
        await runOpenAICompatibleLiveTest(settings, options.fetcher)
        return {
          ok: true,
          provider: settings.provider,
          model: settings.model,
          code: 'AI_PROVIDER_READY',
          message: '真实连通成功；模型已返回可解析 JSON。',
        }
      } catch (error) {
        const code = error instanceof AIProviderError ? error.code : 'AI_PROVIDER_UNAVAILABLE'
        return {
          ok: false,
          provider: settings.provider,
          model: settings.model,
          code,
          message: '真实连通失败；请检查地址、模型、Key、额度或网络。',
        }
      }
    },

    async generateSetupAdvice(input: SetupAdviceProviderRequest, clientProvider?: ClientAIProviderSettings): Promise<SetupAdviceDraft> {
      const settings = settingsFromClientProvider(clientProvider, env)
      if (!settings.enabled) {
        return fallbackSetupAdviceDraft(input, 'AI 未启用，已使用本地模板顺序。')
      }
      if (settings.provider !== 'openai-compatible' || !isAIProviderConfigured(settings)) {
        return fallbackSetupAdviceDraft(input, 'AI 配置不完整，已使用本地模板顺序。')
      }

      try {
        const provider = createOpenAICompatibleSetupAdviceProvider({
          baseUrl: settings.baseUrl ?? '',
          model: settings.model ?? '',
          apiKey: settings.apiKey ?? '',
          timeoutSeconds: settings.timeoutSeconds,
          fetcher: options.fetcher,
        })
        return (await provider.generateSetupAdvice(input)).draft
      } catch (error) {
        logAIProviderFailure(env, 'setup-advice', error)
        const code = error instanceof AIProviderError ? error.code : 'AI_PROVIDER_UNAVAILABLE'
        return fallbackSetupAdviceDraft(input, `AI \u914d\u677f\u5efa\u8bae\u5931\u8d25\uff08${code}\uff09\uff0c\u5df2\u4f7f\u7528\u672c\u5730\u6a21\u677f\u987a\u5e8f\u3002`)
      }
    },

    async generateNightSettlementAdvice(input: NightSettlementProviderRequest, clientProvider?: ClientAIProviderSettings): Promise<NightSettlementAdviceDraft> {
      const settings = settingsFromClientProvider(clientProvider, env)
      if (!settings.enabled) {
        return fallbackNightSettlementAdviceDraft(input, 'AI 未启用，已使用本地结果候选。')
      }
      if (settings.provider !== 'openai-compatible' || !isAIProviderConfigured(settings)) {
        return fallbackNightSettlementAdviceDraft(input, 'AI 配置不完整，已使用本地结果候选。')
      }

      try {
        const provider = createOpenAICompatibleNightSettlementProvider({
          baseUrl: settings.baseUrl ?? '',
          model: settings.model ?? '',
          apiKey: settings.apiKey ?? '',
          timeoutSeconds: settings.timeoutSeconds,
          fetcher: options.fetcher,
        })
        return (await provider.generateNightSettlementAdvice(input)).draft
      } catch (error) {
        logAIProviderFailure(env, 'night-settlement-advice', error)
        return fallbackNightSettlementAdviceDraft(input, 'AI 夜间建议失败，已使用本地结果候选。')
      }
    },

    async generateReviewDraft(
      archive: GameArchiveRecord,
      reviewOptions: { reviewStyle?: 'neutral' | 'sharp'; includePlayerScores?: boolean },
      clientProvider?: ClientAIProviderSettings,
    ) {
      const settings = settingsFromClientProvider(clientProvider, env)
      if (!isAIProviderConfigured(settings)) {
        return {
          draft: generateFakeReviewDraft(archive, reviewOptions),
          warnings: ['fake_review_draft', 'provider_unconfigured', 'draft_only'],
        }
      }

      try {
        const provider = createOpenAICompatibleReviewDraftProvider({
          baseUrl: settings.baseUrl ?? '',
          model: settings.model ?? '',
          apiKey: settings.apiKey ?? '',
          timeoutSeconds: settings.timeoutSeconds,
          fetcher: options.fetcher,
        })
        return await provider.generateReviewDraft(archive, reviewOptions)
      } catch (error) {
        logAIProviderFailure(env, 'review-draft', error)
        return {
          draft: generateFakeReviewDraft(archive, reviewOptions),
          warnings: ['fake_review_draft', 'provider_failed', 'draft_only'],
        }
      }
    },
  }
}
