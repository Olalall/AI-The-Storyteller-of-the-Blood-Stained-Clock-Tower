import { roleSnapshotsForScript, roleTeamByIdForScript } from '../../domain/scripts'
import { createSmartScriptSetupSession } from '../../features/game-session/data/createPrototypeSession'
import { gameSessionReducer } from '../../features/game-session/state/sessionReducer'
import { actNight, projected } from '../../features/night-workbench/state/nightInformation.test-support'
import { emptyWakeDraft, projectPlayerChoice } from '../../features/night-workbench/state/projectWakeDraft'
import { projectKazaliAllocation } from '../../features/game-session/state/applyKazaliAllocation'
import { nightContextKey } from '../../features/night-workbench/state/gameSessionAdapter'

export function actualKazaliInput(playerCount: number, otherNight = false, scriptId = 'one-in-one-out') {
  const at = '2026-10-18T00:00:00.000Z'
  const teams = roleTeamByIdForScript(scriptId), roles = roleSnapshotsForScript(scriptId)
  const goodRoles = [...roles.filter(role => teams[role.id] === 'outsider'), ...roles.filter(role => teams[role.id] === 'townsfolk')]
  let session = createSmartScriptSetupSession(scriptId, at, { playerCount })
  session = gameSessionReducer(session, { type: 'set-setup-draft', draft: { candidateId: 'kazali-ai-manual-setup', revision: 1, updatedAt: at,
    assignments: [...goodRoles.slice(0, playerCount - 1), roles.find(role => role.id === 'kazali')!].map((role, index) => ({ seatId: index + 1, role })),
    demonBluffs: goodRoles.slice(playerCount - 1, playerCount + 2) } })
  session = gameSessionReducer(session, { type: 'confirm-setup', id: 'kazali-ai-setup', confirmedAt: at })
  session = gameSessionReducer(session, { type: 'start-next-night-run' })
  if (otherNight) {
    const first = projected(session).queue.find(entry => entry.roleId === 'kazali')!
    session = actNight(actNight(session, { type: 'preview', id: first.id }), { type: 'activate-preview' })
    for (let index = 0; index < first.targetRoleChoiceCount!; index++) session = actNight(session, { type: 'target-role-choice', index, seatId: index + 1, roleId: first.roleChoices![index].id })
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    session = actNight(session, { type: 'confirm', advance: false })
    const plan = projectKazaliAllocation(session)!
    session = gameSessionReducer(session, { type: 'apply-kazali-allocation', nightRunId: plan.run.id, sourceEntryId: plan.record!.id, expectedContextKey: nightContextKey(session), confirmedAt: at })
    session = gameSessionReducer(session, { type: 'open-phase-segment', phaseKind: 'night', createdAt: at })
    for (const item of projected(session).queue) session = actNight(session, { type: 'skip-item', id: item.id, reason: 'AI 单夜隔离夹具不执行首夜技能。' })
    session = gameSessionReducer(session, { type: 'close-active-night-run', nightRunId: session.activeNightRunId!, closedAt: at })
    session = gameSessionReducer(session, { type: 'open-phase-segment', phaseKind: 'day', createdAt: at })
    session = gameSessionReducer(session, { type: 'confirm-day-no-execution', daySegmentId: session.phaseSegments.at(-1)!.id, entryId: 'kazali-ai-no-execution', confirmedAt: at })
    session = gameSessionReducer(session, { type: 'close-open-segment', phaseKind: 'day', closedAt: at })
    session = gameSessionReducer(session, { type: 'start-next-night-run' })
  }
  const wake = projected(session).queue.find(entry => entry.roleId === 'kazali')!
  session = actNight(actNight(session, { type: 'preview', id: wake.id }), { type: 'activate-preview' })
  const state = projected(session)
  const item = state.queue.find(entry => entry.id === state.activeCursorId)!
  const targets = Object.values(state.seatSnapshots).filter(seat => seat.role?.id !== 'kazali').slice(0, item.targetCount).map(seat => seat.seatId)
  const draft = { ...emptyWakeDraft(), targets, draftRevision: 2, storytellerContext: '说书人已核对这是初始卡扎力首次分配，发动者健康清醒，没有额外相克。只记录选择，尚未应用身份、阵营和夜序。',
    ...(item.targetRoleChoiceCount ? { targetRoleChoices: targets.map((seatId, index) => ({ seatId, roleId: item.roleChoices![index].id })) } : {}) }
  draft.playerChoice = projectPlayerChoice(item, draft)
  return { state, item, draft }
}

