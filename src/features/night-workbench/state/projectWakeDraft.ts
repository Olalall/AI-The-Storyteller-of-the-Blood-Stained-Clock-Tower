import type { AIAdviceReference, WakeDraft, WakeItem, WakeOutcomeOption } from '../types'
import { bluffLabels, systemStepBluffs, systemStepChecks, systemStepMissingReason } from './systemSteps'

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

export function selectedRegistrationLabel(item: WakeItem, draft: WakeDraft) {
  return item.registrationSpec?.choices.find((choice) => choice.id === draft.registration?.value)?.label ?? ''
}

export function hasForbiddenRegistration(item: WakeItem, draft: WakeDraft) {
  return Boolean(draft.registration?.value && item.forbiddenRegistrationValues?.includes(draft.registration.value))
}

export function projectPlayerChoice(item: WakeItem, draft: WakeDraft) {
  if (item.systemStep) {
    const checked = systemStepChecks(draft)
    const done = item.systemStep.checks.filter((check) => checked.includes(check.id)).map((check) => check.label)
    const bluffs = bluffLabels(item.systemStep, draft)
    return [
      done.length ? `已确认：${done.join('、')}` : '',
      bluffs ? `不在场善良角色：${bluffs}` : '',
    ].filter(Boolean).join(' · ')
  }

  const targets = targetText(draft.targets)
  const role = selectedRoleLabel(item, draft)
  const registration = selectedRegistrationLabel(item, draft)
  const parts: string[] = []

  if (targets) parts.push(item.targetKind === 'storyteller_info' ? `告知${targets}` : `选择${targets}`)
  if (role) parts.push(`${item.roleLabel ?? '角色'}：${role}`)
  if (registration) parts.push(`${item.registrationSpec?.label ?? '登记'}：${registration}`)

  return parts.join(' · ')
}

export function wakeTargetRange(item: WakeItem) {
  return {
    minimum: item.minimumTargetCount ?? item.targetCount,
    maximum: item.targetCount,
  }
}

export function wakeTargetsValid(item: WakeItem, draft: WakeDraft, playerCount?: number) {
  const { minimum, maximum } = wakeTargetRange(item)
  if (minimum < 0 || maximum < 0 || minimum > maximum) return false
  return draft.targets.length >= minimum && wakeTargetsStructurallyValid(item, draft, playerCount)
}

export function wakeTargetsStructurallyValid(item: WakeItem, draft: WakeDraft, playerCount?: number) {
  const { minimum, maximum } = wakeTargetRange(item)
  if (minimum < 0 || maximum < 0 || minimum > maximum) return false
  if (draft.targets.length > maximum) return false
  const uniqueTargets = new Set(draft.targets)
  if (uniqueTargets.size !== draft.targets.length) return false
  return draft.targets.every((seatId) =>
    Number.isInteger(seatId) &&
    seatId > 0 &&
    (playerCount === undefined || seatId <= playerCount) &&
    !item.forbiddenTargetSeatIds?.includes(seatId),
  )
}

export function wakeTargetsSatisfyRequiredInput(item: WakeItem, draft: WakeDraft) {
  if (!wakeTargetsValid(item, draft)) return false
  if (item.targetCount <= 0) return false
  return draft.targets.length > 0
}

function wakeTargetsReadyForOutcome(option: WakeOutcomeOption, item: WakeItem, draft: WakeDraft) {
  if (!wakeTargetsValid(item, draft)) return false
  if (option.targetCounts?.length) return option.targetCounts.includes(draft.targets.length)
  return wakeTargetsSatisfyRequiredInput(item, draft)
}

function renderTemplate(template: string, item: WakeItem, draft: WakeDraft) {
  const targets = targetText(draft.targets)
  const role = selectedRoleLabel(item, draft)
  const registration = selectedRegistrationLabel(item, draft)
  const values: Record<string, string> = {
    actor: item.systemStep ? item.roleName : `${item.seatId}号${item.roleName}`,
    target: targets,
    targets,
    role,
    registration,
    bluffs: item.systemStep ? bluffLabels(item.systemStep, draft) : '',
  }

  return template.replace(/\{(actor|target|targets|role|registration|bluffs)\}/g, (_, key: string) => values[key] ?? '')
}

/**
 * 唤醒项本身要求的输入。有些结果选项声明 requiredInputs 为空（例如「未受影响」），
 * 但只要这一项需要目标或角色，就不能在它们缺席时记录任何结果——否则会写下
 * 一条没有对象的假记录，而它同样可确认、同样进本局记录。
 */
export function wakeInputsSatisfied(item: WakeItem, draft: WakeDraft) {
  // 系统步骤卡没有目标，但勾选清单和三张伪装同样是「这条记录成立的前提」：
  // 少了它们写出来的就是一条没有内容的假记录。
  if (item.systemStep && systemStepMissingReason(item, draft)) return false
  if (!wakeTargetsValid(item, draft)) return false
  if (item.registrationSpec && !selectedRegistrationLabel(item, draft)) return false
  if (hasForbiddenRegistration(item, draft)) return false
  return !item.roleChoices || Boolean(selectedRoleLabel(item, draft))
}

export function outcomeReady(option: WakeOutcomeOption, item: WakeItem, draft: WakeDraft) {
  if (!wakeInputsSatisfied(item, draft)) return false
  return option.requiredInputs.every((input) => {
    if (input === 'targets') return wakeTargetsReadyForOutcome(option, item, draft)
    return Boolean(selectedRoleLabel(item, draft))
  })
}

/** 草稿是否已被动过。progress 上没有 'draft' 这个状态，判「有没有未确认的编辑」只能看内容。 */
export function hasWakeDraftContent(draft: WakeDraft) {
  return draft.targets.length > 0 ||
    systemStepChecks(draft).length > 0 ||
    systemStepBluffs(draft).length > 0 ||
    Boolean(draft.roleChoice) ||
    Boolean(draft.registration) ||
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
