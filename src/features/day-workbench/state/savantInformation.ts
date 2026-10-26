import { roleTeamByIdForScript } from '../../../domain/scripts'
import { projectCurrentAssignments, projectCurrentPlayerStates } from '../../game-session/state/projectors'
import type { GameSessionState } from '../../game-session/types'
import { nightContextKey } from '../../night-workbench/state/gameSessionAdapter'

export interface SavantStatement { text: string; truth: boolean; evidence: string; family: string }
export interface SavantPair { statements: [SavantStatement, SavantStatement] }
export const savantInformationContextKey = (session: GameSessionState, seatId: number | null) =>
  `${nightContextKey(session)}:${session.phaseSegments.findLast(p => p.kind === 'day' && !p.closedAt)?.id ?? 'no-day'}:${seatId}`

/** 只编写基于已确认身份的候选，不猜未录入的毒醉、误认或技能结果。 */
export function savantInformation(session: GameSessionState, actorSeatId: number) {
  const assignments = projectCurrentAssignments(session), states = projectCurrentPlayerStates(session)
  const teams = roleTeamByIdForScript(session.scriptId)
  const vortex = assignments.find(a => ['vortox', 'vortex'].includes(a.role.id) && states[a.seatId]?.life === 'alive' && !states[a.seatId]?.poisoned && !states[a.seatId]?.drunk)
  const actor = states[actorSeatId]
  const mode = vortex ? 'vortox' : actor?.poisoned || actor?.drunk ? 'impaired' : 'normal'
  const facts: SavantStatement[] = []
  const width = Math.max(3, Math.floor(assignments.length / 2))
  for (let start = 1; start + width - 1 <= session.playerCount; start += Math.max(2, Math.floor(width / 2))) {
    const end = start + width - 1
    const group = assignments.filter(a => a.seatId >= start && a.seatId <= end)
    for (const team of ['townsfolk', 'outsider'] as const) {
      const actual = group.filter(a => teams[a.role.id] === team)
      const label = team === 'townsfolk' ? '镇民' : '外来者'
      const threshold = team === 'townsfolk' ? Math.ceil(width / 2) : 1
      const evidence = `按已确认真实身份：${actual.map(a => `${a.seatId}号${a.role.name}`).join('、') || '无'}；共${actual.length}名${label}。`
      const family = `${start}-${end}-${team}`
      facts.push({ text: `${start}至${end}号中，至少有${threshold}名${label}。`, truth: actual.length >= threshold, evidence, family })
      facts.push({ text: `${start}至${end}号中，少于${threshold}名${label}。`, truth: actual.length < threshold, evidence, family })
    }
  }
  const pairs: SavantPair[] = []
  for (const first of facts) {
    const second = facts.find(f => f.family !== first.family && f.truth === (mode === 'vortox' ? false : !first.truth))
    if (second && (mode !== 'vortox' || !first.truth)) pairs.push({ statements: [first, second] })
    if (pairs.length >= 8) break
  }
  return { mode, pairs, contextKey: savantInformationContextKey(session, actorSeatId),
    warning: vortex ? '涡流能力有效：两条信息都必须是假，即使博学者中毒或醉酒。'
      : mode === 'impaired' ? '博学者已记录毒醉：不受一真一假限制。以下仍给出一真一假候选，可由说书人改写。'
        : '正常博学者：一条真、一条假。只向玩家展示两句话，不展示真伪或依据。' }
}
