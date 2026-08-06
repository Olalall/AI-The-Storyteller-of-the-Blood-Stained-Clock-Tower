import type { NightSettlementProviderRequest, SetupAdviceProviderRequest } from './types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function validPlayerCount(value: unknown) {
  return Number.isInteger(value) && Number(value) >= 7 && Number(value) <= 15
}

function validStringArray(value: unknown) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function validRoleResearch(value: unknown) {
  if (value === undefined) return true
  return isRecord(value)
    && typeof value.roleId === 'string'
    && typeof value.name === 'string'
    && typeof value.knowledgeStatus === 'string'
    && validStringArray(value.inputKinds)
    && validStringArray(value.setupImpact)
    && validStringArray(value.possibleOutcomes)
    && validStringArray(value.stateChanges)
    && validStringArray(value.identityChanges)
    && validStringArray(value.teamChanges)
    && validStringArray(value.playerMessageTemplates)
    && validStringArray(value.highRiskNotes)
    && validStringArray(value.sourceUrls)
}

function validRoleKnowledge(value: unknown) {
  if (value === undefined) return true
  return isRecord(value)
    && typeof value.roleId === 'string'
    && typeof value.title === 'string'
    && validStringArray(value.riskTags)
    && validStringArray(value.requiredContext)
    && validStringArray(value.reminders)
    && validStringArray(value.aiCannot)
}

function validRolePool(value: unknown) {
  if (value === undefined) return true
  return Array.isArray(value) && value.every((role) => (
    isRecord(role)
    && typeof role.roleId === 'string'
    && typeof role.roleName === 'string'
    && typeof role.team === 'string'
    && typeof role.abilityText === 'string'
    && (role.inputKinds === undefined || validStringArray(role.inputKinds))
    && (role.setupImpact === undefined || validStringArray(role.setupImpact))
    && (role.possibleOutcomes === undefined || validStringArray(role.possibleOutcomes))
    && (role.highRiskNotes === undefined || validStringArray(role.highRiskNotes))
    && validRoleKnowledge(role.roleKnowledge)
    && validRoleResearch(role.roleResearch)
  ))
}

/**
 * contextLevel 缺省合法：旧客户端不发这个字段，拒收会让它们整个 AI 功能一起挂掉，
 * 而这个字段的缺失本来就有明确语义（「客户端没说」，见 nightUnknownSeats）。
 * 但值一旦出现就必须是两档之一——收下一个 'partial' 会让 provider 的
 * `contextLevel !== 'minimal'` 判成「知情完整」，静默走回加这个字段之前的行为。
 */
function validContextLevel(value: unknown) {
  return value === undefined || value === 'minimal' || value === 'standard'
}

function validUnknownSeatIds(value: unknown) {
  return value === undefined || (Array.isArray(value) && value.every((seatId) => Number.isInteger(seatId)))
}

function validSelectedTargets(value: unknown) {
  if (value === undefined) return true
  return Array.isArray(value) && value.every((target) => (
    isRecord(target)
    && Number.isInteger(target.seatId)
    && typeof target.playerLabel === 'string'
    && typeof target.roleId === 'string'
    && typeof target.roleName === 'string'
    && isRecord(target.status)
    && typeof target.status.life === 'string'
    && validStringArray(target.status.impairments)
    && validStringArray(target.status.markers)
  ))
}

export function isSetupAdviceRequest(value: unknown): value is SetupAdviceProviderRequest {
  if (!isRecord(value)) return false
  if (typeof value.scriptId !== 'string' || typeof value.scriptName !== 'string') return false
  if (typeof value.knowledgeVersion !== 'string') return false
  if (!validPlayerCount(value.playerCount)) return false
  if (!Array.isArray(value.seats) || !Array.isArray(value.candidates) || !value.candidates.length) return false
  if (!validRolePool(value.rolePool)) return false
  return value.candidates.every((candidate) => (
    isRecord(candidate)
    && typeof candidate.id === 'string'
    && typeof candidate.title === 'string'
    && typeof candidate.summary === 'string'
    && Array.isArray(candidate.roles)
    && Array.isArray(candidate.demonBluffs)
    && candidate.roles.every((role) => isRecord(role) && validRoleKnowledge(role.roleKnowledge) && validRoleResearch(role.roleResearch))
  ))
}

export function isNightSettlementRequest(value: unknown): value is NightSettlementProviderRequest {
  if (!isRecord(value)) return false
  if (typeof value.scriptId !== 'string' || typeof value.knowledgeVersion !== 'string') return false
  if (typeof value.nightRunId !== 'string' || typeof value.phaseLabel !== 'string') return false
  if (!validPlayerCount(value.playerCount) || !isRecord(value.wakeItem) || !isRecord(value.draft)) return false
  if (!Array.isArray(value.availableOutcomes) || !value.availableOutcomes.length) return false
  if (!validContextLevel(value.contextLevel) || !validUnknownSeatIds(value.unknownSeatIds)) return false
  return typeof value.wakeItem.id === 'string'
    && typeof value.wakeItem.roleId === 'string'
    && typeof value.wakeItem.roleName === 'string'
    && typeof value.wakeItem.ability === 'string'
    && Number.isInteger(value.wakeItem.seatId)
    && Array.isArray(value.draft.targets)
    && typeof value.draft.roleChoice === 'string'
    && typeof value.draft.outcomeId === 'string'
    && validSelectedTargets(value.selectedTargets)
    && validRoleResearch(value.roleResearch)
    && value.availableOutcomes.every((outcome) => (
      isRecord(outcome)
      && typeof outcome.id === 'string'
      && typeof outcome.label === 'string'
      && typeof outcome.ready === 'boolean'
      && Array.isArray(outcome.requiredInputs)
    ))
}
