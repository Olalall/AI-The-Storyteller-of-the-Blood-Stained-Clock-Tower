interface PrototypeAIResultTemplate {
  recommendedOutcomeId: string
  summary: string
  facts: string[]
  confidence: 'low' | 'medium' | 'high'
}

const resultTemplates: Record<string, PrototypeAIResultTemplate> = {
  'night-3-cerenovus': {
    recommendedOutcomeId: 'applied',
    summary: '建议填入“受到影响”作为结果草稿。',
    facts: ['目标与角色均已选择'],
    confidence: 'medium',
  },
}

export function getPrototypeAIResultTemplate(wakeItemId: string) {
  return resultTemplates[wakeItemId]
}
