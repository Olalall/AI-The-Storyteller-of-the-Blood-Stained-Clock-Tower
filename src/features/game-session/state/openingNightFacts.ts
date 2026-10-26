import { normalizeRoleId, roleSnapshotsForScript, roleTeamByIdForScript } from '../../../domain/scripts'
import type { GameSessionState } from '../types'
import type { WakeItem } from '../../night-workbench/types'
import { openingChoiceForSeat } from './openingPreparation'
import { projectCurrentAssignments, projectCurrentPlayerStates } from './projectors'
import { openingAssignmentKey } from './openingPreparation'

/** 已确认的开局选择只约束告知表单，不重新施加毒醉或能力。 */
export function projectOpeningNightFacts(session: GameSessionState, item: WakeItem, runId: string): WakeItem {
  if (item.progress === 'confirmed' && session.nightRuns[runId]?.correctionItemId !== item.id) return item
  if (normalizeRoleId(item.roleId) === 'poppygrower' && item.progress !== 'confirmed') item = {
    ...item, aiAdviceEnabled: false, targetCount: 0, roleChoices: undefined,
    playerLabel: `说书人核对 · ${item.seatId}号罂粟种植者（不唤醒本人）`,
    storytellerPrompt: '这是主持核对步骤，不唤醒罂粟本人。首夜有效时隐藏相认但保留真恶魔伪装；死亡后使用上方入口补入当晚相认，并核对死亡时毒醉与魔术师。',
    systemStep: { kind: 'audience_notice', audienceLabel: '主持核对', recipientLabels: [], minionLabels: [], demonLabel: '',
      infoTokens: ['仅说书人核对，不展示给玩家'], checks: [{ id: 'poppy-reviewed', label: '已核对罂粟状态、相认和真恶魔伪装' }], sensitive: true },
    outcomeOptions: [{ id: 'record', label: '已核对罂粟规则', requiredInputs: [], resultTemplate: '说书人已核对罂粟状态、相认及恶魔伪装；未唤醒罂粟本人。' }],
  }
  const choice = openingChoiceForSeat(session, item.seatId)
  if (choice && normalizeRoleId(item.roleId) === 'alchemist' && choice.chosenRoleId) {
    const role = roleSnapshotsForScript(session.scriptId).find(r => r.id === choice.chosenRoleId)
    if (role) item = { ...item, roleChoices: [{ id: role.id, label: role.name }], openingNote: `开局已确认：${role.name}。能力与提示标记已保存；本项按已确认选择告知。`,
      storytellerPrompt: `开局已确认：${role.name}。本项只向玩家告知并记录；能力和标记已保存，若要改变选择请从能力/状态入口追加更正。` }
  }
  if (choice?.targetSeatId && choice.sourceRoleId && normalizeRoleId(item.roleId) === 'pixie') {
    const assignments = projectCurrentAssignments(session), states = projectCurrentPlayerStates(session), teams = roleTeamByIdForScript(session.scriptId)
    const vortexes = assignments.filter(a => ['vortex', 'vortox'].includes(a.role.id))
    const vortexActive = vortexes.some(a => states[a.seatId]?.life === 'alive' && !states[a.seatId]?.drunk && !states[a.seatId]?.poisoned)
    const impaired = states[item.seatId]?.drunk || states[item.seatId]?.poisoned
    const inPlay = new Set(assignments.map(a => a.role.id))
    const expectedRoleIds = vortexActive ? roleSnapshotsForScript(session.scriptId).filter(r => teams[r.id] === 'townsfolk' && !inPlay.has(r.id)).map(r => r.id)
      : impaired ? undefined : [choice.sourceRoleId]
    const statuses = [item.seatId, ...vortexes.map(a => a.seatId)].map(id => `${id}:${states[id]?.life}:${states[id]?.drunk}:${states[id]?.poisoned}`).join('|')
    item = { ...item, openingNote: `实际标记：${choice.targetSeatId}号；计划告知：${roleSnapshotsForScript(session.scriptId).find(r => r.id === choice.chosenRoleId)?.name ?? '待选'}。告知与标记分别留存，不会自动继承能力。`,
      hostConfirmation: { label: '已核对小精灵信息真假、标记来源与当前毒醉', checkId: `pixie-reviewed:${statuses}:${openingAssignmentKey(assignments)}`,
        summary: vortexActive ? '当前已录涡流能力有效：小精灵须获得假信息。候选应为不在场镇民；如有特殊裁定，请补充依据。'
          : impaired ? '小精灵当前已录毒醉，告知可以不真实；实际标记来源另存。' : '当前未录有效涡流或小精灵毒醉；正常告知实际标记的镇民角色。',
        ...(expectedRoleIds ? { expectedRoleIds } : {}) } }
  }
  if (choice?.text && ['amnesiac', 'mezepheles'].includes(normalizeRoleId(item.roleId))) item = {
    ...item, openingNote: `开局已确认：${choice.text}`, storytellerPrompt: `开局已确认：${choice.text}。按此约定告知；更改能力或阵营需要另行确认。`,
  }
  const teams = roleTeamByIdForScript(session.scriptId)
  if (teams[item.roleId] !== 'demon' || item.systemStep || item.progress === 'not_applicable') return item
  const lunatics = projectCurrentAssignments(session).filter(a => normalizeRoleId(a.role.id) === 'lunatic')
  if (!lunatics.length) return item
  const run = session.nightRuns[runId]
  const disclosures = lunatics.map(lunatic => {
    const source = session.timeline.findLast(e => e.kind === 'night_action' && e.nightRunId === runId && e.actorSeatId === lunatic.seatId
      && e.roleId === 'lunatic' && !session.timeline.some(c => c.correctionOf === e.id) && !run?.queue.find(q => q.id === e.wakeItemId)?.systemStep)
    const skipped = run?.queue.find(q => q.roleId === 'lunatic' && q.seatId === lunatic.seatId && !q.systemStep)
    const notWaking = !skipped || ['not_applicable', 'skipped'].includes(skipped.progress)
    return { seat: lunatic.seatId, source, notWaking }
  })
  const blocked = disclosures.some(d => !d.source && !d.notWaking)
  if (disclosures.every(d => !d.source && d.notWaking)) {
    const { hostConfirmation: _old, ...withoutDisclosure } = item
    return withoutDisclosure
  }
  const keys = disclosures.map(d => d.source?.id ?? `no-choice-${d.seat}`).join(':')
  const summary = disclosures.map(d => d.source?.kind === 'night_action'
    ? `${d.seat}号疯子：${d.source.record.snapshot.targets.length ? d.source.record.snapshot.targets.map(s => `${s}号`).join('、') : '本夜未选择攻击目标（核对蓄力/不行动记录）'}`
    : `${d.seat}号疯子：${d.notWaking ? '本夜无假装行动；请核对身份告知' : '尚未确认选择，请先处理疯子'}`).join('；')
  return { ...item, hostConfirmation: { label: '已向真恶魔传达疯子身份与本夜选择', checkId: `lunatic-told:${keys}`, summary, ...(blocked ? { blockedReason: '请先确认疯子的假装行动，再向真恶魔传达选择。' } : {}) } }
}
