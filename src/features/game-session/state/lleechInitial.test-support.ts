import { roleSnapshotsForScript } from '../../../domain/scripts'
import { createSmartScriptSetupSession } from '../data/createPrototypeSession'
import { gameSessionReducer } from './sessionReducer'
import { projectCurrentPlayerStates } from './projectors'
import type { GameSessionState } from '../types'
import { actNight, projected } from '../../night-workbench/state/nightInformation.test-support'

const at = '2026-10-18T00:00:00.000Z'
export function focusLleechWake(session: GameSessionState, id: string) {
  return actNight(actNight(session, { type: 'preview', id }), { type: 'activate-preview' })
}

/** 480 正式模板12-3：7T2O2M1D，无人数修正；只用真实会话命令推进。 */
export function lleechFirstNightFixture() {
  const scriptId = 'feng-mao-zhi-yan', snapshots = roleSnapshotsForScript(scriptId)
  const ids = ['flowergirl', 'juggler', 'courtier', 'seamstress', 'philosopher', 'cannibal', 'farmer', 'mutant', 'hatter', 'assassin', 'goblin', 'vortox']
  let session = createSmartScriptSetupSession(scriptId, at, { playerCount: 12 })
  session = gameSessionReducer(session, { type: 'set-setup-draft', draft: {
    candidateId: 'feng-mao-zhi-yan-12-3', revision: 1, updatedAt: at,
    assignments: ids.map((id, index) => ({ seatId: index + 1, role: snapshots.find((role) => role.id === id)! })),
    demonBluffs: ['innkeeper', 'poppygrower', 'sweetheart'].map((id) => snapshots.find((role) => role.id === id)!),
  } })
  session = gameSessionReducer(session, { type: 'confirm-setup', id: 'lleech-initial-setup', confirmedAt: at })
  if (!session.timeline.some((entry) => entry.kind === 'setup_confirmed')) throw new Error('Lleech fixture must use a legal confirmed setup')
  return gameSessionReducer(session, { type: 'start-next-night-run' })
}

export function lleechLaterNightFixture() {
  let session = gameSessionReducer(lleechFirstNightFixture(), { type: 'open-phase-segment', phaseKind: 'night', createdAt: at })
  for (const item of projected(session).queue) session = actNight(session, { type: 'skip-item', id: item.id, reason: '本隔离场景不模拟其它首夜能力。' })
  session = gameSessionReducer(session, { type: 'close-active-night-run', nightRunId: session.activeNightRunId!, closedAt: at })
  session = gameSessionReducer(session, { type: 'open-phase-segment', phaseKind: 'day', createdAt: at })
  session = gameSessionReducer(session, { type: 'confirm-day-no-execution', daySegmentId: session.phaseSegments.at(-1)!.id, entryId: 'lleech-day-no-execution', confirmedAt: at })
  session = gameSessionReducer(session, { type: 'close-open-segment', phaseKind: 'day', closedAt: at })
  session = gameSessionReducer(session, { type: 'start-next-night-run' })
  const oldDemon = projected(session).queue.find((item) => item.seatId === 12 && item.roleId === 'vortox')!
  session = focusLleechWake(session, oldDemon.id)
  session = actNight(actNight(session, { type: 'target', seatId: 9 }), { type: 'outcome', outcomeId: 'record' })
  session = actNight(session, { type: 'confirm', advance: false })
  const hatterBefore = projectCurrentPlayerStates(session)[9]
  session = gameSessionReducer(session, { type: 'confirm-player-state-change', seatId: 9, expectedBefore: hatterBefore,
    after: { ...hatterBefore, life: 'dead' }, segmentId: session.nightRuns[session.activeNightRunId!].phaseSegmentId,
    entryId: 'lleech-hatter-death', confirmedAt: new Date().toISOString(), reason: '主持确认帽匠因旧恶魔本夜攻击有效死亡，触发当夜角色选择。' })
  const hatter = projected(session).queue.find((item) => item.seatId === 9 && item.roleId === 'hatter')!
  session = focusLleechWake(session, hatter.id)
  session = actNight(session, { type: 'resolve-applicability', value: 'applicable' })
  session = actNight(session, { type: 'storyteller-context', value: '帽匠有效死亡；12号旧恶魔本夜攻击已记录，主持将单独确认新角色与宿主初始化，不追加第二刀。' })
  session = actNight(session, { type: 'target', seatId: 12 })
  session = actNight(session, { type: 'outcome', outcomeId: 'record' })
  session = actNight(session, { type: 'confirm', advance: false })
  const oldStatus = projectCurrentPlayerStates(session)[3]
  session = gameSessionReducer(session, { type: 'confirm-player-state-change', seatId: 3, expectedBefore: oldStatus,
    after: { ...oldStatus, poisoned: true, drunk: true, markers: [{ id: 'manual-alignment', label: '当前善良阵营' }, { id: 'duration-ledger', label: '持续状态待主持核对' }] },
    segmentId: session.nightRuns[session.activeNightRunId!].phaseSegmentId, entryId: 'lleech-existing-statuses', confirmedAt: new Date().toISOString(), reason: '保留已有人工毒醉和持续状态，不由换角命令处理。' })
  return session
}
