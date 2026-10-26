import type { AbilityChangedEntry, GameSessionState } from '../types'
import type { GameSessionAction } from './sessionActions'
import { roleSnapshotsForScript, roleTeamByIdForScript } from '../../../domain/scripts'
import { projectCurrentAssignments, projectCurrentPlayerStates } from './projectors'
import { nightContextKey } from '../../night-workbench/state/gameSessionAdapter'
import { abilityNightItems, projectAbilityItem } from './abilityNightQueue'
import { insertNightItems } from './insertNightItems'
import { openingChoiceForSeat } from './openingPreparation'

export const abilitySourceLabels: Readonly<Record<string, string>> = {
  philosopher: '哲学家', alchemist: '炼金术士', boffin: '科学怪人', pixie: '小精灵', cannibal: '食人族',
}

export function projectAbilityGrants(session: GameSessionState): AbilityChangedEntry[] {
  const grants = new Map<string, AbilityChangedEntry>()
  const corrected = new Set(session.timeline.flatMap(entry => entry.correctionOf ? [entry.correctionOf] : []))
  for (const entry of session.timeline) {
    if (entry.kind === 'ability_changed') {
      const key = `${entry.sourceSeatId}:${entry.sourceRoleId}`
      if (entry.abilityRole && (!entry.sourceEntryId || !corrected.has(entry.sourceEntryId))) grants.set(key, entry)
      else grants.delete(key)
    }
    if (entry.kind === 'setup_changed') {
      for (const [key, grant] of grants) if (grant.seatId === entry.seatId || grant.sourceSeatId === entry.seatId) grants.delete(key)
    }
    if (entry.kind === 'execution' && entry.causedDeath !== false && !corrected.has(entry.id)) {
      for (const [key, grant] of grants) if (grant.sourceRoleId === 'cannibal' && grant.sourceEntryId !== entry.id) grants.delete(key)
    }
  }
  let changed = true
  while (changed) {
    changed = false
    for (const [key, grant] of grants) if (grant.parentGrantId && ![...grants.values()].some(g => g.id === grant.parentGrantId)) { grants.delete(key); changed = true }
  }
  return [...grants.values()]
}

export function abilityRoleChoices(session: GameSessionState, sourceRoleId: string) {
  const teams = roleTeamByIdForScript(session.scriptId)
  const inPlay = new Set(projectCurrentAssignments(session).map(a => a.role.id))
  return roleSnapshotsForScript(session.scriptId).filter(role => {
    if (sourceRoleId === 'alchemist') return teams[role.id] === 'minion'
    if (sourceRoleId === 'cannibal') return teams[role.id] === 'townsfolk' || teams[role.id] === 'outsider' || teams[role.id] === 'minion' || teams[role.id] === 'demon'
    if (sourceRoleId === 'pixie') return teams[role.id] === 'townsfolk'
    return (teams[role.id] === 'townsfolk' || teams[role.id] === 'outsider')
      && (sourceRoleId !== 'boffin' || !inPlay.has(role.id) && !['drunk', 'heretic', 'ogre', 'politician'].includes(role.id)
        || sourceRoleId === 'boffin' && role.id === 'villageidiot')
  })
}

export function confirmAbilityChange(session: GameSessionState, action: Extract<GameSessionAction, { type: 'confirm-ability-change' }>) {
  const assignments = projectCurrentAssignments(session), teams = roleTeamByIdForScript(session.scriptId)
  const actor = assignments.find(a => a.seatId === action.seatId)?.role
  const source = assignments.find(a => a.seatId === action.sourceSeatId)?.role
  const sourceGrant = projectAbilityGrants(session).find(g => g.seatId === action.sourceSeatId && g.abilityRole?.id === action.sourceRoleId)
  const ability = action.roleId === null ? null : abilityRoleChoices(session, action.sourceRoleId).find(r => r.id === action.roleId)
  const killedExecutee = session.timeline.findLast(e => e.kind === 'execution' && e.causedDeath !== false && !session.timeline.some(c => c.correctionOf === e.id))
  const pixieInfo = session.timeline.findLast(e => e.kind === 'night_action' && e.actorSeatId === action.sourceSeatId && e.roleId === 'pixie'
    && !session.timeline.some(c => c.correctionOf === e.id))
  const pixiePreparation = action.sourceRoleId === 'pixie' ? openingChoiceForSeat(session, action.sourceSeatId) : undefined
  const pixieInformationReviewed = pixieInfo?.kind === 'night_action' && pixieInfo.record.snapshot.roleChoice === pixiePreparation?.sourceRoleId || action.informationMismatchReviewed === true
  const pixieSourceValid = pixiePreparation?.targetSeatId && pixiePreparation.sourceRoleId
    ? action.triggerSeatId === pixiePreparation.targetSeatId && pixieInformationReviewed && (ability?.id === pixiePreparation.sourceRoleId
      || action.informationMismatchReviewed === true && pixieInfo?.kind === 'night_action' && pixieInfo.record.snapshot.roleChoice !== pixiePreparation.sourceRoleId)
    : pixieInfo?.kind === 'night_action' && (pixieInfo.record.snapshot.roleChoice === ability?.id || action.informationMismatchReviewed === true)
  const sourceEntryId = action.sourceRoleId === 'cannibal' ? killedExecutee?.id
    : action.sourceRoleId === 'pixie' ? pixieInfo?.id : action.sourceEntryId
  const run = session.activeNightRunId ? session.nightRuns[session.activeNightRunId] : undefined
  const openRun = run && !session.phaseSegments.some(p => p.id === run.phaseSegmentId && p.closedAt) ? run : undefined
  if (!actor || !source || !Object.hasOwn(abilitySourceLabels, action.sourceRoleId)
    || source.id !== action.sourceRoleId && !sourceGrant || actor.id !== action.expectedRoleId
    || action.sourceRoleId !== 'boffin' && action.seatId !== action.sourceSeatId
    || action.sourceRoleId === 'boffin' && teams[actor.id] !== 'demon'
    || action.roleId !== null && !ability || !action.reason.trim() || !action.id.trim()
    || !['tonight', 'later'].includes(action.timing) || !Number.isFinite(Date.parse(action.confirmedAt))
    || action.expectedContextKey !== nightContextKey(session) || session.timeline.some(e => e.id === action.id)
    || run?.privacyShielded || run?.correctionItemId
    || ability && action.sourceRoleId === 'cannibal' && (!killedExecutee || action.sourceEntryId && action.sourceEntryId !== killedExecutee.id)
    || ability && action.sourceRoleId === 'pixie' && (pixieInfo?.kind !== 'night_action' || !pixieSourceValid
      || !action.triggerSeatId || projectCurrentPlayerStates(session)[action.triggerSeatId]?.life !== 'dead')
    || action.sourceEntryId && !session.timeline.some(e => e.id === action.sourceEntryId && !session.timeline.some(c => c.correctionOf === e.id))) return session
  const entry: AbilityChangedEntry = { id: action.id, kind: 'ability_changed', segmentId: openRun?.phaseSegmentId ?? null,
    createdAt: action.confirmedAt, confirmedBy: 'storyteller', sourceSeatId: action.sourceSeatId, sourceRoleId: action.sourceRoleId,
    seatId: action.seatId, actorRole: { ...actor }, abilityRole: ability ? { ...ability } : null,
    sourceEntryId, ...(sourceGrant ? { parentGrantId: sourceGrant.id } : {}), ...(action.triggerSeatId ? { triggerSeatId: action.triggerSeatId } : {}), timing: action.timing,
    reason: (action.sourceRoleId === 'pixie' && action.informationMismatchReviewed ? '已人工核对告知真假与实际标记来源；' : '') + action.reason.trim() }
  const next = { ...session, timeline: [...session.timeline, entry] }
  if (!openRun) return next
  const queue = openRun.queue.map(item => projectAbilityItem(next, item))
  const additions = ability && action.timing === 'tonight' ? abilityNightItems(next, entry, openRun.id, openRun.nightType === 'first' ? 1 : 2, true) : []
  const updated = insertNightItems(next, openRun, queue, additions)
  const active = updated.find(item => ['pending', 'draft'].includes(item.progress) && item.applicability !== 'not_applicable')
    ?? updated.find(item => item.id === openRun.activeCursorId)!
  return { ...next, nightRuns: { ...next.nightRuns, [openRun.id]: { ...openRun, queue: updated, revision: openRun.revision + 1,
    activeCursorId: active.id, previewEntryId: active.id,
    lastNotice: ability ? `${action.seatId}号获得${ability.name}能力，真实身份保留。${additions.length ? '已加入当夜夜序。' : '已记录；后续按能力时点处理。'}毒醉、死亡和持续效果请另行确认。`
      : `${action.seatId}号能力已撤销，未发动项已停用；已确认记录和草稿保留。` } } }
}
