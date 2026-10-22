import { getSmartScriptPack } from '../../../domain/scripts'
import type { NightRunState, GameSessionState } from '../types'
import type { WakeItem } from '../../night-workbench/types'
import { mergeFirstNightSystemSteps } from './firstNightSystemSteps'

/** 换角与获得能力共用顺序；已确认记录从不重排或覆盖。 */
export function insertNightItems(session: GameSessionState, run: Pick<NightRunState, 'nightType' | 'activeCursorId'>, original: WakeItem[], additions: WakeItem[]) {
  const firstNightSystems = run.nightType === 'first' ? original.filter(item=>item.systemStep) : []
  const queue = run.nightType === 'first' ? original.filter(item=>!item.systemStep) : [...original]
  const orders = getSmartScriptPack(session.scriptId).nightOrders[run.nightType === 'first' ? 'firstNight' : 'otherNight']
  const order = new Map(orders.map(item => [item.roleId, item.order]))
  const timingRoleId = (item: WakeItem) => /^drunk\/pretend-(.+)-v1$/.exec(item.interactionVersion)?.[1]
    ?? (item.interactionVersion === 'marionette/pretend-v1' ? session.identityPresentations?.[item.seatId]?.shownRole.id
      : item.systemStep?.kind === 'audience_notice' ? item.roleId.replace(/^system-audience-/, '') : item.roleId) ?? item.roleId
  for (const item of additions) {
    if (item.interactionVersion === 'legion/collective-night-v1' && queue.some(known => known.roleId === 'legion' && known.progress !== 'not_applicable')) continue
    if (item.systemStep?.kind === 'audience_notice') {
      if (run.nightType === 'first') firstNightSystems.push(item)
      else queue.splice(0, queue.length, ...mergeFirstNightSystemSteps(queue, [item]))
      continue
    }
    const rank = item.abilityPhase === 'initial' ? undefined : order.get(timingRoleId(item))
    const index = rank === undefined ? queue.findIndex(known => known.id === run.activeCursorId) + 1
      : queue.findIndex(known => (order.get(timingRoleId(known)) ?? Infinity) > rank)
    queue.splice(index < 0 ? queue.length : index, 0, { ...item,
      reason: `${item.reason ? `${item.reason} ` : ''}主持已确认当晚处理新获得的能力；核对时点、旧持续效果及使用次数。`,
    })
  }
  for (const initial of additions.filter(item => item.abilityPhase === 'initial')) {
    const index = queue.findIndex(item => item.id === initial.id)
    const attack = queue.findIndex(item => item.seatId === initial.seatId && item.roleId === initial.roleId && item.abilityPhase !== 'initial' && item.progress !== 'confirmed')
    if (attack >= 0 && index > attack) queue.splice(attack, 0, ...queue.splice(index, 1))
  }
  return (run.nightType === 'first' ? mergeFirstNightSystemSteps(queue, firstNightSystems) : queue).map((item, index) => ({ ...item, orderIndex: index + 1 }))
}
