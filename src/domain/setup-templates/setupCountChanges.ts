import type { SetupCountedTeam, SmartScriptPack } from '../scripts/types'

type Counts = Record<SetupCountedTeam, number>
type Delta = Partial<Counts>
export interface SetupBoundedTransfer { readonly from: 'outsider'; readonly to: 'townsfolk'; readonly maximum: 1 }
export interface SetupCountChange { delta: Delta; boundedTransfer?: SetupBoundedTransfer }

// Source-backed setup facts, not a general clamp or an ability/state engine.
// https://wiki.bloodontheclocktower.com/Vigormortis#How_to_Run
const vigormortisTransfer: SetupBoundedTransfer = { from: 'outsider', to: 'townsfolk', maximum: 1 }
const mandatorySetupRoles = new Set([
  'vigormortis', 'fanggu', 'baron', 'godfather', 'summoner', 'lordoftyphon',
])
// Other mandatory facts: official role pages Fang_Gu, Baron, Godfather,
// Summoner and Lord_of_Typhon. Optional Balloonist/Sentinel are deliberately absent.
export function isMandatorySetupCountRole(roleId: string | undefined) {
  return roleId !== undefined && mandatorySetupRoles.has(roleId)
}

export function boundedSetupTransferForRole(roleId: string | undefined, delta: Delta): SetupBoundedTransfer | undefined {
  return roleId === 'vigormortis' && delta.outsider === -1 && delta.townsfolk === 1
    && (delta.minion ?? 0) === 0 && (delta.demon ?? 0) === 0 ? vigormortisTransfer : undefined
}

export function isValidSetupCountChangeForRole(roleId: string | undefined, delta: Delta) {
  return roleId !== 'vigormortis' || boundedSetupTransferForRole(roleId, delta) !== undefined
}

/** Same trusted rule/role association as the existing modifier projection. */
export function inferModifierRoleId(ruleId: string, pack: SmartScriptPack) {
  const explicit = pack.setupRules.find((rule) => rule.id === ruleId)?.roleId
  if (explicit) return explicit
  const token = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '')
  return pack.roles.find((role) => token(ruleId).includes(token(role.id)))?.id
}

/** Ordinary selected deltas first; then only explicitly sourced bounded transfers. */
export function resolveSetupCountChanges(base: Counts, changes: readonly SetupCountChange[]) {
  const counts = { ...base }
  const effectiveDeltas: Delta[] = changes.map(() => ({}))
  const isBounded = (change: SetupCountChange) => change.boundedTransfer?.from === 'outsider'
    && change.boundedTransfer.to === 'townsfolk' && change.boundedTransfer.maximum === 1
    && change.delta.outsider === -1 && change.delta.townsfolk === 1
    && (change.delta.minion ?? 0) === 0 && (change.delta.demon ?? 0) === 0
  changes.forEach((change, index) => {
    if (isBounded(change)) return
    effectiveDeltas[index] = { ...change.delta }
    for (const team of Object.keys(counts) as SetupCountedTeam[]) counts[team] += change.delta[team] ?? 0
  })
  changes.forEach((change, index) => {
    if (!isBounded(change)) return
    const removed = Math.min(1, Math.max(0, counts.outsider))
    counts.outsider -= removed
    counts.townsfolk += removed
    effectiveDeltas[index] = { townsfolk: removed, outsider: -removed }
  })
  return { counts, effectiveDeltas }
}
