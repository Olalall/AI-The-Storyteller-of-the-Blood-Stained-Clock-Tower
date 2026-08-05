import type { AIAdviceReference, WakeDraft, WakeItem, WakeOutcomeOption } from '../types'

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
  return item.roleChoices?.find((role) => role.id === draft.roleChoice)?.label ?? ''
}

export function projectPlayerChoice(item: WakeItem, draft: WakeDraft) {
  const targets = targetText(draft.targets)
  const role = selectedRoleLabel(item, draft)
  const parts: string[] = []

  if (targets) parts.push(item.targetKind === 'storyteller_info' ? `告知${targets}` : `选择${targets}`)
  if (role) parts.push(`${item.roleLabel ?? '角色'}：${role}`)

  return parts.join(' · ')
}

function renderTemplate(template: string, item: WakeItem, draft: WakeDraft) {
  const targets = targetText(draft.targets)
  const role = selectedRoleLabel(item, draft)
  const values: Record<string, string> = {
    actor: `${item.seatId}号${item.roleName}`,
    target: targets,
    targets,
    role,
  }

  return template.replace(/\{(actor|target|targets|role)\}/g, (_, key: string) => values[key] ?? '')
}

/**
 * 唤醒项本身要求的输入。有些结果选项声明 requiredInputs 为空（例如「未受影响」），
 * 但只要这一项需要目标或角色，就不能在它们缺席时记录任何结果——否则会写下
 * 一条没有对象的假记录，而它同样可确认、同样进本局记录。
 */
export function wakeInputsSatisfied(item: WakeItem, draft: WakeDraft) {
  if (draft.targets.length < item.targetCount) return false
  return !item.roleChoices || Boolean(selectedRoleLabel(item, draft))
}

export function outcomeReady(option: WakeOutcomeOption, item: WakeItem, draft: WakeDraft) {
  if (!wakeInputsSatisfied(item, draft)) return false
  return option.requiredInputs.every((input) => {
    if (input === 'targets') return draft.targets.length === item.targetCount
    return Boolean(selectedRoleLabel(item, draft))
  })
}

/** 草稿是否已被动过。progress 上没有 'draft' 这个状态，判「有没有未确认的编辑」只能看内容。 */
export function hasWakeDraftContent(draft: WakeDraft) {
  return draft.targets.length > 0 ||
    Boolean(draft.roleChoice) ||
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

  const storytellerResult = renderTemplate(option.resultTemplate, item, draft)
  const informationGiven = option.informationTemplate
    ? renderTemplate(option.informationTemplate, item, draft)
    : ''
  if (unresolvedToken.test(storytellerResult) || unresolvedToken.test(informationGiven)) return draft

  const modifiedFromAI = draft.outputSource?.kind === 'ai'
    ? {
        adviceId: draft.outputSource.adviceId,
        contextRevision: draft.outputSource.contextRevision,
        sourceDraftRevision: draft.outputSource.sourceDraftRevision,
        knowledgeVersion: draft.outputSource.knowledgeVersion,
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
    },
  }
}
