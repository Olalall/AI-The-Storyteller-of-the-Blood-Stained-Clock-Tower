import { AIProviderError, callOpenAICompatibleJSON, type OpenAICompatibleClientSettings } from './aiProviderClient'
import { rulesAdvisorContext } from './rulesAdvisorContext'
import { rulesAdvisorMessages } from './rulesAdvisorPrompt'
import { isRulesAdvisorAnswer, type RulesAdvisorAnswer, type RulesAdvisorRequest } from '../../src/services/ai/rulesAdvisorTypes'

export async function generateRulesAdvisorAnswer(input: RulesAdvisorRequest, settings: OpenAICompatibleClientSettings): Promise<RulesAdvisorAnswer> {
  const knowledge = await rulesAdvisorContext(input)
  const payload = await callOpenAICompatibleJSON<Record<string, unknown>>(settings, rulesAdvisorMessages(input, knowledge))
  const lines = (key: string) => Array.isArray(payload?.[key])
    ? payload[key].filter((line): line is string => typeof line === 'string' && Boolean(line.trim())).slice(0, 8).map(line => line.trim().slice(0, 1200)) : []
  const ids = new Set(lines('sourceIds'))
  const answer = {
    summary: typeof payload?.summary === 'string' ? payload.summary.trim().slice(0, 3000) : '',
    ruleFacts: lines('ruleFacts'), considerations: lines('considerations'), missingFacts: lines('missingFacts'),
    sources: knowledge.sources.filter(source => ids.has(source.id)).slice(0, 8),
    knowledgeVersion: knowledge.knowledgeVersion, scopeLabel: knowledge.scopeLabel,
  }
  if (!isRulesAdvisorAnswer(answer)) throw new AIProviderError('AI_PROVIDER_BAD_RESPONSE', 502)
  return answer
}
