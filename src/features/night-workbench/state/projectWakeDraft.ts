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

export function outcomeReady(option: WakeOutcomeOption, item: WakeItem, draft: WakeDraft) {
  return option.requiredInputs.every((input) => {
    if (input === 'targets') return draft.targets.length === item.targetCount
    return Boolean(selectedRoleLabel(item, draft))
  })
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
