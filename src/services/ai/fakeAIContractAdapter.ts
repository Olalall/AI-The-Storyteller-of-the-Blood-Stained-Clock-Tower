import type {
  AIContractAdapter,
  AIContractRequest,
  AIContractResponse,
  NightSettlementDraft,
  ReviewDraftContract,
  SetupAdviceDraft,
} from './types'

function baseResponse(request: AIContractRequest) {
  return {
    requestId: request.requestId,
    kind: request.kind,
    provider: 'fake' as const,
    draftOnly: true as const,
    suggestedJournalEntries: [] as const,
  }
}

function setupAdvice(request: Extract<AIContractRequest, { kind: 'setup_advice' }>): AIContractResponse<SetupAdviceDraft> {
  const missing = request.context.playerCount < 7 || request.context.playerCount > 15 ? ['人数不在 7-15 范围'] : []
  return {
    ...baseResponse(request),
    status: missing.length ? 'needs_input' : 'answer',
    confidence: request.context.candidateIds.length ? 'medium' : 'low',
    ruleFacts: ['AI 配板只能返回候选草稿；说书人确认前不写入身份。'],
    assumptions: ['玩家经验只用于提醒，不自动决定角色。'],
    missing,
    result: {
      recommendedCandidateIds: request.context.candidateIds.slice(0, 3),
      warnings: request.context.candidateIds.length ? [] : ['当前人数暂无已核对模板候选。'],
      balanceSummary: request.context.candidateIds.length
        ? ['候选仅按当前人数和模板顺序排序；说书人确认前不写入身份。']
        : [],
      storytellerNotes: ['AI 只给配板草稿；座位、身份和伪装仍由说书人核对。'],
      microAdjustments: [],
      qualityTags: request.context.candidateIds.slice(0, 3).map((candidateId) => ({
        candidateId,
        label: '待复核',
        tone: 'stable' as const,
        reason: 'fake adapter 只保留合同形状，不代表真实平衡判断。',
      })),
    },
  }
}

function nightAdvice(request: Extract<AIContractRequest, { kind: 'night_settlement' }>): AIContractResponse<NightSettlementDraft> {
  const { draft, roleKnowledge, roleResearch, wakeItem } = request.context
  const missing = [
    wakeItem.targetCount > draft.targets.length ? '目标未选完' : '',
  ].filter(Boolean)
  const roleFacts = [
    'AI 只能给出技能结果草稿，不能直接改变玩家状态或日志。',
    ...(roleKnowledge?.reminders ?? []),
    ...(roleResearch?.possibleOutcomes.slice(0, 2) ?? []),
    ...(roleResearch?.highRiskNotes.slice(0, 2) ?? []),
  ]
  const boundaryFact = roleKnowledge?.aiCannot.length ? `禁止自动执行：${roleKnowledge.aiCannot.join('、')}` : undefined
  return {
    ...baseResponse(request),
    status: missing.length ? 'needs_input' : 'answer',
    confidence: missing.length ? 'low' : 'medium',
    ruleFacts: [...roleFacts.slice(0, boundaryFact ? 5 : 6), ...(boundaryFact ? [boundaryFact] : [])],
    assumptions: [
      `当前处理角色为 ${wakeItem.roleName}`,
      ...(roleKnowledge ? [`已加载复杂角色摘要：${roleKnowledge.title}`] : []),
      ...(roleResearch ? [`已加载智能板子角色调研：${roleResearch.name}`] : []),
    ],
    missing,
    result: {
      recommendedOutcomeId: draft.outcomeId || undefined,
      summary: missing.length
        ? '请先补齐说书人需要确认的选择。'
        : `可按 ${wakeItem.roleName} 当前录入生成结果草稿。`,
    },
  }
}

function reviewDraft(request: Extract<AIContractRequest, { kind: 'review_draft' }>): AIContractResponse<ReviewDraftContract> {
  const recordCount = request.context.summary.records
  return {
    ...baseResponse(request),
    status: 'answer',
    confidence: recordCount >= 8 ? 'medium' : 'low',
    ruleFacts: ['复盘草稿只基于归档日志，不能代表玩家真实水平。'],
    assumptions: ['没有语音和完整发言记录，评分只能作为说书人复盘草稿。'],
    missing: recordCount ? [] : ['归档日志为空'],
    result: {
      summary: `${request.context.scriptName} · ${request.context.winnerLabel} · ${recordCount} 条记录。`,
      playerReviewCount: request.context.playerCount,
      disclaimer: 'fake 草稿：仅基于结构化日志，不是客观评分。',
    },
  }
}

export const fakeAIContractAdapter: AIContractAdapter = {
  request(request) {
    switch (request.kind) {
      case 'setup_advice':
        return setupAdvice(request)
      case 'night_settlement':
        return nightAdvice(request)
      case 'review_draft':
        return reviewDraft(request)
    }
  },
}
