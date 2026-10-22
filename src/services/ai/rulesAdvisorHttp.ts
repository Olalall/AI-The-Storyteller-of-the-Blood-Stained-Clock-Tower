import { readAIRuntimeSettings, type AIRuntimeSettings } from './aiRuntimeSettings'
import { modelRequestTimeoutMs } from './modelRequestTimeout'
import { isRulesAdvisorAnswer, type RulesAdvisorAnswer, type RulesAdvisorRequest } from './rulesAdvisorTypes'

export async function askRulesAdvisor(input: RulesAdvisorRequest, signal: AbortSignal, runtime: AIRuntimeSettings = readAIRuntimeSettings()): Promise<RulesAdvisorAnswer> {
  if (runtime.mode !== 'http') throw new Error('问答需要连接 AI 后端，请先在 AI 设置中检查连接。')
  const timeout = AbortSignal.timeout(modelRequestTimeoutMs(runtime.timeoutMs))
  try {
    const response = await fetch(`${runtime.baseUrl.replace(/\/$/, '')}/api/ai/rules-advisor`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input), signal: AbortSignal.any([signal, timeout]),
    })
    const body = await response.json() as { accepted?: boolean; data?: { answer?: unknown }; error?: { code?: string } }
    if (body.error?.code === 'AI_ACCESS_REQUIRED') throw new Error('设备验证已到期，请先验证访问口令再重试。')
    if (response.status === 429) throw new Error('请求太频繁，请稍后重试。问题已保留。')
    if (!response.ok || body.accepted !== true || !isRulesAdvisorAnswer(body.data?.answer)) {
      throw new Error('AI 暂时无法回答，请稍后重试或查看角色原文。问题已保留。')
    }
    return body.data.answer
  } catch (error) {
    if (signal.aborted) throw error
    if (timeout.aborted) throw new Error('回答超时，问题已保留，可以重试。')
    if (error instanceof TypeError || error instanceof SyntaxError) throw new Error('连接或回答格式异常，问题已保留，可以重试。')
    throw error
  }
}
