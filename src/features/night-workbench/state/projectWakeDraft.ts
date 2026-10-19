import type { AIAdviceReference, WakeDraft, WakeItem, WakeOutcomeOption } from '../types'
import { canRevealNightResult } from '../../../domain/scripts/nightInteractionInputs'

const unresolvedToken = /\{[a-z]+\}/i

export function emptyWakeDraft(): WakeDraft {
  return {
    targets: [],
    roleChoice: '',
    outcomeId: '',
    playerChoice: '',
    storytellerResult: '',
    informationGiven: '',
    draftRevision: 0,
  }
}

function targetText(targets: number[]) {
  return targets.map((seat) => `${seat}号`).join('、')
}

export function selectedRoleLabel(item: WakeItem, draft: WakeDraft) {
  return selectedRoleIds(item, draft).map((id) => item.roleChoices?.find((role) => role.id === id)?.label).filter(Boolean).join(' / ')
}

export function selectedRoleIds(item: WakeItem, draft: WakeDraft) {
  return [draft.roleChoice, draft.secondRoleChoice ?? '', ...(draft.additionalRoleChoices ?? [])].slice(0, item.roleCount ?? 1)
}

export function targetRoleChoicesSatisfied(item: WakeItem, draft: WakeDraft, playerCount = 15) {
  const count = item.targetRoleChoiceCount
  if (count === undefined) return true
  const choices = draft.targetRoleChoices
  return [1, 2, 3].includes(count) && choices?.length === count && draft.targets.length === count &&
    choices.every((choice, index) => Number.isInteger(choice.seatId) && choice.seatId > 0 && choice.seatId <= playerCount &&
      item.roleChoices?.some((role) => role.id === choice.roleId) && draft.targets[index] === choice.seatId) &&
    new Set(choices.map((choice) => choice.seatId)).size === count && new Set(choices.map((choice) => choice.roleId)).size === count
}

function targetRoleText(item: WakeItem, draft: WakeDraft) {
  return (draft.targetRoleChoices ?? []).filter((choice) => choice.seatId > 0 || choice.roleId).map((choice) =>
    `${choice.seatId > 0 ? `${choice.seatId}号` : '待选玩家'} → ${item.roleChoices?.find((role) => role.id === choice.roleId)?.label ?? '待选爪牙'}`).join('；')
}

export function selectedTargetCount(item: WakeItem, draft: WakeDraft) {
  return draft.targetCountChoice !== undefined && item.allowedTargetCounts?.includes(draft.targetCountChoice)
    ? draft.targetCountChoice : item.targetCount
}

export function targetCountChosen(item: WakeItem, draft: WakeDraft) {
  return !item.allowedTargetCounts || (draft.targetCountChoice !== undefined && item.allowedTargetCounts.includes(draft.targetCountChoice))
}

export function roleInputsSatisfied(item: WakeItem, draft: WakeDraft) {
  if (item.targetRoleChoiceCount !== undefined) return targetRoleChoicesSatisfied(item, draft)
  if (!item.roleChoices) return item.roleCount !== 2 && item.roleCount !== 4
  const first = item.roleChoices.find((role) => role.id === draft.roleChoice)
  if (item.roleCount === 4) {
    const ids = selectedRoleIds(item, draft)
    return ids.length === 4 && new Set(ids).size === 4 && ids.every((id, index) =>
      item.roleChoices?.find((role) => role.id === id)?.alignment === (index % 2 === 0 ? 'good' : 'evil'))
  }
  if (item.roleCount !== 2) return Boolean(first)
  const second = item.roleChoices.find((role) => role.id === draft.secondRoleChoice)
  return Boolean(first?.alignment && second?.alignment && first.alignment !== second.alignment)
}

export function projectPlayerChoice(item: WakeItem, draft: WakeDraft) {
  if (item.targetRoleChoiceCount !== undefined) return targetRoleText(item, draft)
  const targets = targetText(draft.targets)
  const role = selectedRoleLabel(item, draft)
  const parts: string[] = []

  if (item.allowedTargetCounts && targetCountChosen(item, draft)) parts.push(`本次选择${selectedTargetCount(item, draft)}名玩家`)

  if (targets) parts.push(item.targetKind === 'storyteller_info' ? `告知${targets}` : `选择${targets}`)
  if (role) parts.push(`${item.roleLabel ?? '角色'}：${role}`)

  return parts.join(' · ')
}

function renderTemplate(template: string, item: WakeItem, draft: WakeDraft) {
  const targets = item.allowedTargetCounts && draft.targetCountChoice === 0 ? '不选择玩家' : targetText(draft.targets)
  const role = selectedRoleLabel(item, draft)
  const values: Record<string, string> = {
    actor: `${item.seatId}号${item.roleName}`,
    target: targets,
    targets,
    role,
    targetRoles: targetRoleText(item, draft),
  }

  return template.replace(/\{(actor|target|targets|role|targetRoles)\}/g, (_, key: string) => values[key] ?? '')
}

/**
 * 唤醒项本身要求的输入。有些结果选项声明 requiredInputs 为空（例如「未受影响」），
 * 但只要这一项需要目标或角色，就不能在它们缺席时记录任何结果——否则会写下
 * 一条没有对象的假记录，而它同样可确认、同样进本局记录。
 * 明确“不发动”的 hold/skip 由 outcomeReady 单独处理，不能要求虚构目标或能力。
 */
export function wakeInputsSatisfied(item: WakeItem, draft: WakeDraft) {
  if (!targetCountChosen(item, draft) || draft.targets.length !== selectedTargetCount(item, draft)) return false
  return roleInputsSatisfied(item, draft)
}

export function missingWakeInputReason(item: WakeItem, draft: WakeDraft) {
  if (item.targetRoleChoiceCount !== undefined && !targetRoleChoicesSatisfied(item, draft)) return `补齐${item.targetRoleChoiceCount}组玩家与爪牙，玩家和角色不可重复`
  if (!targetCountChosen(item, draft)) return '选择本次目标人数'
  if (selectedTargetCount(item, draft) > draft.targets.length) return `选${item.targetLabel ?? '目标'}`
  if (item.roleChoices && !roleInputsSatisfied(item, draft)) return item.roleCount === 4
    ? '选两善两恶四个不同角色' : item.roleCount === 2 ? '选一善一恶两个角色' : `选${item.roleLabel ?? '角色'}`
  return ''
}

export function outcomeReady(option: WakeOutcomeOption, item: WakeItem, draft: WakeDraft) {
  if (item.targetRoleChoiceCount !== undefined && !targetRoleChoicesSatisfied(item, draft)) return false
  if (!isNoActionOutcome(option) && !wakeInputsSatisfied(item, draft)) return false
  return option.requiredInputs.every((input) => {
    if (input === 'targets') return draft.targets.length === selectedTargetCount(item, draft)
    return roleInputsSatisfied(item, draft)
  })
}

function isNoActionOutcome(option: WakeOutcomeOption) {
  return (option.id === 'hold' || option.id === 'skip') && option.requiredInputs.length === 0
}

/** 草稿是否已被动过。progress 上没有 'draft' 这个状态，判「有没有未确认的编辑」只能看内容。 */
export function hasWakeDraftContent(draft: WakeDraft) {
  return draft.targets.length > 0 ||
    Boolean(draft.targetRoleChoices?.some((choice) => choice.seatId > 0 || choice.roleId)) ||
    draft.targetCountChoice !== undefined ||
    Boolean(draft.roleChoice) ||
    Boolean(draft.secondRoleChoice) ||
    Boolean(draft.additionalRoleChoices?.some(Boolean)) ||
    Boolean(draft.storytellerContext?.trim()) ||
    Boolean(draft.outcomeId) ||
    Boolean(draft.storytellerResult.trim()) ||
    Boolean(draft.informationGiven.trim())
}

export function invalidateOutcome(item: WakeItem, draft: WakeDraft): WakeDraft {
  return {
    ...draft,
    outcomeId: '',
    playerChoice: projectPlayerChoice(item, draft),
    storytellerResult: '',
    informationGiven: '',
    outputSource: undefined,
  }
}

export function applyDefaultOutcome(item: WakeItem, draft: WakeDraft): WakeDraft {
  if (draft.outcomeId) return draft
  const defaultOption = item.outcomeOptions.find((option) =>
    option.label === '受到影响' && outcomeReady(option, item, draft)
  )
  return defaultOption ? applyOutcome(item, draft, defaultOption.id) : draft
}

export function applyOutcome(item: WakeItem, draft: WakeDraft, outcomeId: string): WakeDraft {
  const option = item.outcomeOptions.find((candidate) => candidate.id === outcomeId)
  if (!option || !outcomeReady(option, item, draft)) return draft
  if (isNoActionOutcome(option)) draft = { ...draft, targets: [], targetRoleChoices: undefined, targetCountChoice: undefined, roleChoice: '', secondRoleChoice: undefined, additionalRoleChoices: undefined }

  const storytellerResult = renderTemplate(option.resultTemplate, item, draft)
  const informationGiven = item.targetRoleChoiceCount === undefined && canRevealNightResult(item.roleId) && option.informationTemplate
    ? renderTemplate(option.informationTemplate, item, draft)
    : ''
  if (unresolvedToken.test(storytellerResult) || unresolvedToken.test(informationGiven)) return draft

  const modifiedFromAI = draft.outputSource?.kind === 'ai'
    ? {
        adviceId: draft.outputSource.adviceId,
        contextRevision: draft.outputSource.contextRevision,
        sourceDraftRevision: draft.outputSource.sourceDraftRevision,
        knowledgeVersion: draft.outputSource.knowledgeVersion,
        contextKey: draft.outputSource.contextKey,
      }
    : draft.outputSource?.modifiedFromAI

  return {
    ...draft,
    outcomeId,
    playerChoice: projectPlayerChoice(item, draft),
    storytellerResult,
    informationGiven,
    outputSource: {
      kind: 'preset',
      templateId: option.id,
      specVersion: item.interactionVersion,
      modifiedFromAI,
    },
  }
}

export function applyAIOutcome(
  item: WakeItem,
  draft: WakeDraft,
  outcomeId: string,
  advice: AIAdviceReference,
): WakeDraft {
  const next = applyOutcome(item, draft, outcomeId)
  if (next === draft) return draft

  return {
    ...next,
    outputSource: {
      kind: 'ai',
      templateId: outcomeId,
      specVersion: item.interactionVersion,
      adviceId: advice.adviceId,
      contextRevision: advice.contextRevision,
      sourceDraftRevision: advice.sourceDraftRevision,
      knowledgeVersion: advice.knowledgeVersion,
      contextKey: advice.contextKey,
    },
  }
}
