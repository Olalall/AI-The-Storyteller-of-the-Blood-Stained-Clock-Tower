import type { AbilityChangedEntry, GameSessionState } from '../types'
import type { WakeItem } from '../../night-workbench/types'
import { createSmartScriptNightQueue } from './smartScriptNightQueue'
import { projectCurrentPlayerStates } from './projectors'
import { projectAbilityGrants } from './abilityChanges'

export function abilityNightItems(session: GameSessionState, grant: AbilityChangedEntry, runId: string, sequence: number, firstUse: boolean): WakeItem[] {
  if (!grant.abilityRole) return []
  if (grant.sourceRoleId === 'alchemist' && ['marionette','mastermind','spy','widow','wraith'].includes(grant.abilityRole.id)) return []
  if (grant.sourceRoleId === 'alchemist' && grant.abilityRole.id === 'summoner' && sequence === 1) return []
  const assignments = [{ seatId: grant.seatId, role: grant.abilityRole }], states = projectCurrentPlayerStates(session)
  let items = createSmartScriptNightQueue(session, assignments, states, `${runId}-${grant.id}`, sequence)
  if (!items.length && sequence > 1 && firstUse) items = createSmartScriptNightQueue(session, assignments, states, `${runId}-${grant.id}`, 1)
  return items.filter(item => !item.systemStep).map(item => projectAbilityItem(session, { ...item,
    roleName: `${grant.actorRole.name}（${grant.abilityRole!.name}能力）`,
    abilitySource: { grantId: grant.id, sourceSeatId: grant.sourceSeatId, sourceRoleId: grant.sourceRoleId, actorRole: { ...grant.actorRole } },
    reason: `${item.reason ? `${item.reason} ` : ''}能力由主持单独确认，真实身份仍为${grant.actorRole.name}。${grant.reason}`,
  }))
}

export function projectAbilityItem(session: GameSessionState, item: WakeItem): WakeItem {
  if (item.progress === 'confirmed') return item
  const grants = projectAbilityGrants(session)
  const grant = item.abilitySource && grants.find(g => g.id === item.abilitySource?.grantId)
  const lastIdentityChange = session.timeline.findLastIndex(entry=>entry.kind==='setup_changed'&&entry.seatId===item.seatId)
  const spentPhilosopher = !item.abilitySource && item.roleId === 'philosopher'
    && session.timeline.slice(lastIdentityChange+1).some(entry=>entry.kind==='ability_changed'&&entry.sourceSeatId===item.seatId&&entry.sourceRoleId==='philosopher'&&entry.abilityRole)
  if (item.abilitySource && !grant || spentPhilosopher) return { ...item, progress: 'not_applicable', applicability: 'not_applicable',
    reason: spentPhilosopher ? '哲学家已确认获得能力，不再重复选择；获得的能力在对应时点处理。' : '此能力已撤销、来源更正或身份已变化；原草稿和已确认记录保留。' }
  if (grant?.sourceRoleId === 'boffin') {
    const source = projectCurrentPlayerStates(session)[grant.sourceSeatId]
    if (source.life === 'dead' || source.drunk || source.poisoned) return { ...item, applicability: 'needs_review',
      reason: '能力来源科学怪人当前死亡或毒醉，请主持核对其能力是否有效、是否涉及死后能力；暂不允许直接确认结果。' }
  }
  return item
}
