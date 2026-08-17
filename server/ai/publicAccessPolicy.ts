import { isIP } from 'node:net'
import type { AIProviderOverrideRequest } from './types'

export type AIPublicAccessMode = 'local' | 'public'

export interface AIPublicAccessPolicyOptions {
  mode?: AIPublicAccessMode
  allowedProviderHostnames?: readonly string[]
}

export interface ResolvedAIPublicAccessPolicy {
  mode: AIPublicAccessMode
  allowedProviderHostnames: ReadonlySet<string>
}

export type PublicProviderValidation =
  | { ok: true }
  | { ok: false; message: string }

const publicProviderRejectedMessage = '公网 AI 仅接受完整的浏览器 BYOK 配置，且 HTTPS 服务域名必须在允许列表中。'

function normalizedHostname(value: string) {
  return value.trim().toLowerCase().replace(/^\[|\]$/g, '').replace(/\.+$/, '')
}

function allowlistFrom(values: readonly string[]) {
  return new Set(values.map(normalizedHostname).filter(Boolean))
}

function envAllowlist(env: NodeJS.ProcessEnv) {
  return (env.BOTC_PUBLIC_AI_ALLOWED_HOSTS ?? '').split(',')
}

export function resolveAIPublicAccessPolicy(
  options: AIPublicAccessPolicyOptions = {},
  env: NodeJS.ProcessEnv = process.env,
): ResolvedAIPublicAccessPolicy {
  const mode = options.mode
    ?? (env.BOTC_PUBLIC_ACCESS_MODE === 'true' || env.BOTC_PUBLIC_ACCESS_MODE === '1' ? 'public' : 'local')
  const allowedProviderHostnames = options.allowedProviderHostnames ?? envAllowlist(env)
  return { mode, allowedProviderHostnames: allowlistFrom(allowedProviderHostnames) }
}

function isUnsafeProviderHostname(hostname: string) {
  if (!hostname || isIP(hostname)) return true
  if (!hostname.includes('.')) return true
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) return true
  if (hostname.endsWith('.local') || hostname.endsWith('.lan') || hostname.endsWith('.internal')) return true
  if (hostname === 'home.arpa' || hostname.endsWith('.home.arpa')) return true
  if (hostname === 'metadata.google.internal' || hostname === 'metadata.azure.internal') return true
  if (hostname === 'instance-data' || hostname === 'host.docker.internal') return true
  if (hostname === 'kubernetes.default' || hostname.endsWith('.svc.cluster.local')) return true
  return false
}

function isCompleteProviderSettings(value: Partial<AIProviderOverrideRequest> | undefined): value is AIProviderOverrideRequest {
  return value?.provider === 'openai-compatible'
    && typeof value.baseUrl === 'string'
    && Boolean(value.baseUrl.trim())
    && typeof value.model === 'string'
    && Boolean(value.model.trim())
    && typeof value.apiKey === 'string'
    && Boolean(value.apiKey.trim())
    && (value.timeoutSeconds === undefined
      || (typeof value.timeoutSeconds === 'number'
        && Number.isFinite(value.timeoutSeconds)
        && value.timeoutSeconds >= 5
        && value.timeoutSeconds <= 120))
}

export function validatePublicProviderSettings(
  settings: Partial<AIProviderOverrideRequest> | undefined,
  policy: ResolvedAIPublicAccessPolicy,
): PublicProviderValidation {
  if (policy.mode !== 'public') return { ok: true }
  if (!isCompleteProviderSettings(settings) || policy.allowedProviderHostnames.size === 0) {
    return { ok: false, message: publicProviderRejectedMessage }
  }

  let url: URL
  try {
    url = new URL(settings.baseUrl)
  } catch {
    return { ok: false, message: publicProviderRejectedMessage }
  }

  const hostname = normalizedHostname(url.hostname)
  if (url.protocol !== 'https:' || url.username || url.password || isUnsafeProviderHostname(hostname)) {
    return { ok: false, message: publicProviderRejectedMessage }
  }
  if (!policy.allowedProviderHostnames.has(hostname)) {
    return { ok: false, message: publicProviderRejectedMessage }
  }
  return { ok: true }
}
