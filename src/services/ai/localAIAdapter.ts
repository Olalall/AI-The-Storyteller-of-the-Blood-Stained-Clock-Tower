import { createSmartScriptSetupCandidates } from '../../features/setup'
import { applyOutcome, outcomeReady } from '../../features/night-workbench/state/projectWakeDraft'
import type { AIAdapter, CreateNightResultAdviceInput } from './types'
import { getPrototypeAIResultTemplate } from './prototypeNightAdvice'
import { getComplexRoleKnowledge, type ComplexRoleKnowledge, type RoleKnowledgeRiskTag } from '../../domain/role-knowledge'
import { roleResearchForAI, roleTeamByIdForScript, type AIRoleResearchBrief } from '../../domain/scripts'
import { nightStatusFactsForAI, selectedNightTargetsForAI } from './nightTargetContext'
import { createLocalGameReviewDraft } from './gameReviewProjection'

function projectedAdviceDrafts({ item, draft, outcomeId, roleKnowledge, roleResearch }: {
  item: CreateNightResultAdviceInput['item']
  draft: CreateNightResultAdviceInput['draft']
  outcomeId?: string
  roleKnowledge?: ComplexRoleKnowledge
  roleResearch?: AIRoleResearchBrief
}) {
  const projected = outcomeId ? applyOutcome(item, draft, outcomeId) : draft
  const journalDrafts = projected.storytellerResult ? [projected.storytellerResult] : []
  const playerMessageDrafts = projected.informationGiven ? [projected.informationGiven] : []
  const stateChangeDrafts = [
    ...(roleKnowledge ? stateChangeDraftsFor(roleKnowledge) : []),
    ...(roleResearch ? researchStateChangeDraftsFor(roleResearch) : []),
  ].slice(0, 5)
  const authorityWarnings = [
    '采用建议只会填入本项草稿；确认本项前不写日志、不改状态。',
    ...(roleKnowledge?.aiCannot.slice(0, 3).map((item) => `AI不能${item}`) ?? []),
  ]

  return { journalDrafts, playerMessageDrafts, stateChangeDrafts, authorityWarnings }
}

function stateChangeDraftsFor(roleKnowledge: ComplexRoleKnowledge) {
  const hints: Partial<Record<RoleKnowledgeRiskTag, string>> = {
    identity: '可能涉及身份变化：确认后从玩家卡片追加身份更改。',
    team: '可能涉及阵营变化：确认后单独记录阵营更改。',
    death: '可能涉及死亡：确认后手动更新生死状态。',
    protection: '可能涉及保护或免死：确认后保留为候选，不自动取消死亡。',
    poison: '可能涉及中毒：确认后在玩家状态中标记。',
    drunk: '可能涉及醉酒：确认后在玩家状态中标记。',
    madness: '涉及疯狂：只给提醒和告知草稿，不判断玩家是否破疯狂。',
    'hidden-info': '涉及隐藏信息：只生成说书人草稿，不自动发送或公开。',
    setup: '涉及开局或人数修正：仅作为核对提醒，不在局中自动重算。',
    delayed: '存在延迟结算：确认后追加后续待办或记录。',
    discretion: '包含说书人裁量：建议仅供核对，最终由你决定。',
    victory: '可能影响胜负：只提醒核对，不自动判定胜负。',
  }

  return roleKnowledge.riskTags
    .map((tag) => hints[tag])
    .filter((item): item is string => Boolean(item))
    .slice(0, 4)
}

function researchStateChangeDraftsFor(roleResearch: AIRoleResearchBrief) {
  return [
    ...roleResearch.stateChanges.map((item) => `状态提醒：${item}`),
    ...roleResearch.identityChanges.map((item) => `身份提醒：${item}`),
    ...roleResearch.teamChanges.map((item) => `阵营提醒：${item}`),
  ].slice(0, 3)
}

function readyOutcomeId(input: CreateNightResultAdviceInput, outcomeId: string) {
  return input.item.outcomeOptions.some((candidate) => candidate.id === outcomeId && outcomeReady(candidate, input.item, input.draft))
    ? outcomeId
    : undefined
}

function inferNightOutcome(input: CreateNightResultAdviceInput) {
  const { state, item, draft } = input
  const actorImpaired = item.status.impairments.includes('poisoned') || item.status.impairments.includes('drunk')
  if (actorImpaired && readyOutcomeId(input, 'no-effect')) return 'no-effect'

  const targetSeatId = draft.targets[0]
  const target = targetSeatId ? state.seatSnapshots[targetSeatId] : undefined
  const targetRoleId = target?.role?.id
  if (!targetRoleId) return undefined

  if (item.roleId === 'gambler' && draft.roleChoice) {
    return readyOutcomeId(input, targetRoleId === draft.roleChoice ? 'correct' : 'wrong')
  }

  if (item.roleId === 'snakecharmer') {
    const targetTeam = roleTeamByIdForScript(state.scriptId)[targetRoleId]
    return readyOutcomeId(input, targetTeam === 'demon' ? 'swap' : 'miss')
  }

  if (item.roleId === 'fanggu') {
    const targetTeam = roleTeamByIdForScript(state.scriptId)[targetRoleId]
    return readyOutcomeId(input, targetTeam === 'outsider' ? 'convert' : 'kill')
  }

  if (item.roleId === 'pithag' && draft.roleChoice) {
    const currentRoleIds = new Set(Object.values(state.seatSnapshots)
      .map((seat) => seat.role?.id)
      .filter((roleId): roleId is string => Boolean(roleId)))
    return readyOutcomeId(input, currentRoleIds.has(draft.roleChoice) ? 'already-in-play' : 'changed')
  }

  return undefined
}

function createNightResultAdvice({ state, item, draft }: CreateNightResultAdviceInput) {
  const input = { state, item, draft }
  const explicitTemplate = getPrototypeAIResultTemplate(item.id)
  const roleKnowledge = getComplexRoleKnowledge(item.roleId)
  const roleResearch = roleResearchForAI(state.scriptId, item.roleId)
  const selectedTargets = selectedNightTargetsForAI(state, draft)
  const statusFacts = nightStatusFactsForAI(item, selectedTargets)
  const fallbackOption = item.outcomeOptions.find((candidate) => outcomeReady(candidate, item, draft)) ?? item.outcomeOptions[0]
  const inferredOutcomeId = inferNightOutcome(input)
  const template = explicitTemplate ?? (fallbackOption ? {
    recommendedOutcomeId: inferredOutcomeId ?? fallbackOption.id,
    summary: `建议先记录为“${item.outcomeOptions.find((option) => option.id === (inferredOutcomeId ?? fallbackOption.id))?.label ?? fallbackOption.label}”；确认前不会改变权威状态。`,
    facts: [`当前角色：${item.roleName}`, inferredOutcomeId ? '已按当前目标身份生成核对建议' : fallbackOption.requiredInputs.length ? '已按当前选择生成候选' : '该结果不需要额外目标'],
    confidence: 'low' as const,
  } : null)

  if (!template) return null

  const option = item.outcomeOptions.find((candidate) => candidate.id === template.recommendedOutcomeId)
  const missing = [
    option?.requiredInputs.includes('targets') && draft.targets.length !== item.targetCount ? `缺少${item.targetLabel ?? '目标'}` : '',
    option?.requiredInputs.includes('role') && !draft.roleChoice ? `缺少${item.roleLabel ?? '角色'}` : '',
  ].filter(Boolean)
  const adviceId = `${item.id}-ai-${state.revision}-${draft.draftRevision}`
  const projected = projectedAdviceDrafts({ item, draft, outcomeId: option?.id, roleKnowledge, roleResearch })

  return {
    id: adviceId,
    adviceId,
    kind: 'result' as const,
    nightRunId: state.nightRunId,
    wakeItemId: item.id,
    contextRevision: state.revision,
    sourceDraftRevision: draft.draftRevision,
    knowledgeVersion: state.knowledgeVersion,
    status: missing.length || !option ? 'needs_input' as const : 'answer' as const,
    recommendedOutcomeId: option?.id,
    summary: roleKnowledge
      ? `${template.summary} ${roleKnowledge.reminders[0] ?? '复杂角色只给提醒，不自动结算。'}`
      : roleResearch?.highRiskNotes[0]
        ? `${template.summary} ${roleResearch.highRiskNotes[0]}`
        : template.summary,
    facts: [
      ...template.facts,
      ...statusFacts,
      ...(roleKnowledge ? roleKnowledge.reminders.slice(0, 2) : []),
      ...(roleResearch ? roleResearch.possibleOutcomes.slice(0, 2) : []),
      ...(roleResearch ? roleResearch.highRiskNotes.slice(0, 2) : []),
      ...(roleKnowledge ? [`禁止自动执行：${roleKnowledge.aiCannot.slice(0, 3).join('、')}`] : []),
    ].slice(0, 8),
    missing: option ? missing : ['建议结果不存在'],
    ...projected,
    confidence: template.confidence,
  }
}

export const localAIAdapter: AIAdapter = {
  generateSetupCandidates(input) {
    return createSmartScriptSetupCandidates(input.scriptId, input.seatProfiles)
  },

  createNightResultAdvice,

  createGameReviewDraft: createLocalGameReviewDraft,
}
