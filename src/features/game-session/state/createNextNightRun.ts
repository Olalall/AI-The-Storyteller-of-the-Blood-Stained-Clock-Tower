import type { GameSessionState, NightRunState } from '../types'
import { projectConfirmedSetup, projectCurrentAssignments, projectCurrentPlayerStates } from './projectors'
import { nextPhaseSequence } from './phaseSegments'
import { createFirstNightSystemSteps, mergeFirstNightSystemSteps } from './firstNightSystemSteps'
import { createSmartScriptNightQueue } from './smartScriptNightQueue'
import { projectAbilityGrants } from './abilityChanges'
import { abilityNightItems, projectAbilityItem } from './abilityNightQueue'
import { insertNightItems } from './insertNightItems'
import { projectOpeningNightFacts } from './openingNightFacts'
import { openingChoiceForSeat } from './openingPreparation'
import { emptyWakeDraft } from '../../night-workbench/state/projectWakeDraft'
export { createSmartScriptNightQueue } from './smartScriptNightQueue'
export function nextNightSequence(session: GameSessionState) {
  return nextPhaseSequence(session, 'night')
}

/**
 * 按剧本首夜/后续夜表和已确认身份生成新夜序，已有夜序不重建。
 * 角色交互只描述录入表单，不根据结果自动修改状态或裁定技能。
 */
export function createNextNightRun(session: GameSessionState): NightRunState | null {
  const sequence = nextNightSequence(session)
  const id = nextNightRunId(session, sequence)
  const assignments = projectCurrentAssignments(session)
  const playerStates = projectCurrentPlayerStates(session)
  let roles = createSmartScriptNightQueue(session, assignments, playerStates, id, sequence).map(item => projectAbilityItem(session, item))
  const additions = projectAbilityGrants(session).flatMap(grant => abilityNightItems(session, grant, id, sequence,
    !Object.values(session.nightRuns).some(run => run.queue.some(item => item.abilitySource?.grantId === grant.id))))
  roles = insertNightItems(session, { nightType: sequence === 1 ? 'first' : 'other', activeCursorId: roles[0]?.id ?? '' }, roles, additions)
  const queue = (sequence === 1
    ? mergeFirstNightSystemSteps(roles, createFirstNightSystemSteps(session, assignments, playerStates, id)) : roles)
    .map((item, index) => projectOpeningNightFacts(session, { ...item, orderIndex: index + 1 }, id))
  if (!queue.length) return null

  return {
    id,
    phaseSegmentId: null,
    scriptId: session.scriptId,
    nightType: sequence === 1 ? 'first' : 'other',
    playerCount: session.playerCount,
    revision: 0,
    knowledgeVersion: session.knowledgeVersion,
    queue,
    activeCursorId: queue[0].id,
    previewEntryId: queue[0].id,
    drafts: Object.fromEntries(queue.flatMap(item => {
      const bluffRoleIds = item.systemStep?.bluffCount ? projectConfirmedSetup(session)?.draft.demonBluffs.map(r => r.id)
        .filter(id => item.systemStep?.bluffChoices?.some(c => c.id === id)) : undefined
      const roleChoice = ['alchemist', 'pixie'].includes(item.roleId) ? openingChoiceForSeat(session, item.seatId)?.chosenRoleId : undefined
      return bluffRoleIds?.length === item.systemStep?.bluffCount && bluffRoleIds?.length || roleChoice
        ? [[item.id, { ...emptyWakeDraft(), ...(bluffRoleIds?.length ? { bluffRoleIds } : {}), ...(roleChoice ? { roleChoice } : {}) }]] : []
    })),
    privacyShielded: false,
    dimmed: false,
    aiAdviceLog: {},
    correctionItemId: null,
    lastNotice: `第${sequence}夜草稿已创建；首次确认后建立记录`,
  }
}

function nextNightRunId(session: GameSessionState, sequence: number) {
  const base = `${session.scriptId}-night-${sequence}`
  if (!session.nightRuns[base]) return base
  let revision = 2
  while (session.nightRuns[`${base}-${revision}`]) revision += 1
  return `${base}-${revision}`
}
