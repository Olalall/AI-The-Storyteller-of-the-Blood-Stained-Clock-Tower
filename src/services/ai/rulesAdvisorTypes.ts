export interface RulesAdvisorRequest {
  scriptId: string
  roleId?: string
  question: string
  history: { question: string; answer: string }[]
}

export interface RulesAdvisorSource { id: string; title: string; url: string }

export interface RulesAdvisorAnswer {
  summary: string
  ruleFacts: string[]
  considerations: string[]
  missingFacts: string[]
  sources: RulesAdvisorSource[]
  knowledgeVersion: string
  scopeLabel: string
}

function boundedText(value: unknown, max: number) {
  return typeof value === 'string' && Boolean(value.trim()) && value.length <= max
}

export function isRulesAdvisorRequest(value: unknown): value is RulesAdvisorRequest {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const v = value as Record<string, unknown>
  return Object.keys(v).every(key => ['scriptId', 'roleId', 'question', 'history'].includes(key))
    && boundedText(v.scriptId, 120) && (v.roleId === undefined || boundedText(v.roleId, 120))
    && boundedText(v.question, 1200) && Array.isArray(v.history) && v.history.length <= 4
    && v.history.every(item => item && typeof item === 'object' && !Array.isArray(item)
      && Object.keys(item).every(key => key === 'question' || key === 'answer')
      && boundedText(item.question, 1200) && boundedText(item.answer, 6000))
}

export function isRulesAdvisorAnswer(value: unknown): value is RulesAdvisorAnswer {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const v = value as Record<string, unknown>
  return boundedText(v.summary, 3000) && boundedText(v.knowledgeVersion, 300) && boundedText(v.scopeLabel, 300)
    && ['ruleFacts', 'considerations', 'missingFacts'].every(key => Array.isArray(v[key])
      && v[key].length <= 8 && v[key].every((line: unknown) => boundedText(line, 1200)))
    && Array.isArray(v.sources) && v.sources.length <= 8 && v.sources.every(source => {
      if (!source || typeof source !== 'object') return false
      const s = source as Record<string, unknown>
      if (!boundedText(s.id, 100) || !boundedText(s.title, 300) || !boundedText(s.url, 2048)) return false
      try { return ['https:', 'http:'].includes(new URL(s.url as string).protocol) } catch { return false }
    })
}
