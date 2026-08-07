import { normalizeRoleId } from '../../../domain/scripts'
import type { DayActionEntry, GameSessionState, NightActionEntry, NightRunState } from '../types'
import type { StorytellerRegistrationSnapshot, WakeItem } from '../../night-workbench/types'
import { projectEffectiveTimelineEntries } from './projectTimelineHistory'
import { projectCurrentPlayerStates } from './projectors'

const previousTargetRoleIds = new Set(['exorcist', 'devilsadvocate'])
const oncePerGameNightRoleIds = new Set(['professor', 'assassin', 'courtier', 'nightwatchman', 'seamstress', 'huntsman', 'engineer'])

function segmentIds(session: GameSessionState, kind: 'night' | 'day', sequence: number) {
  return new Set(session.phaseSegments
    .filter((segment) => segment.kind === kind && segment.sequence === sequence)
    .map((segment) => segment.id))
}

function previousNightEntries(session: GameSessionState, sequence: number) {
  const ids = segmentIds(session, 'night', sequence)
  return projectEffectiveTimelineEntries(session.timeline)
    .filter((entry): entry is NightActionEntry => entry.kind === 'night_action' && ids.has(entry.segmentId ?? ''))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt) || right.id.localeCompare(left.id))
}

function sourceCreatedAt(session: GameSessionState, entry: NightActionEntry | DayActionEntry) {
  let current: NightActionEntry | DayActionEntry | undefined = entry
  while (current.correctionOf) {
    const previous = session.timeline.find((candidate) => candidate.id === current?.correctionOf)
    if (!previous || previous.kind !== entry.kind) break
    current = previous as NightActionEntry | DayActionEntry
  }
  return current.createdAt
}

function nightEntryIdentity(session: GameSessionState, entry: NightActionEntry) {
  let current: NightActionEntry | undefined = entry
  let actorSeatId = entry.actorSeatId
  let roleId = entry.roleId
  const queueItem = session.nightRuns[entry.nightRunId]?.queue.find((item) => item.id === entry.wakeItemId)
  actorSeatId ??= queueItem?.seatId
  roleId ??= queueItem?.roleId
  while ((!actorSeatId || !roleId) && current.correctionOf) {
    const previous = session.timeline.find((candidate) => candidate.id === current?.correctionOf)
    if (!previous || previous.kind !== 'night_action') break
    current = previous
    const previousQueueItem = session.nightRuns[previous.nightRunId]?.queue.find((item) => item.id === previous.wakeItemId)
    actorSeatId ??= previous.actorSeatId
    actorSeatId ??= previousQueueItem?.seatId
    roleId ??= previous.roleId
    roleId ??= previousQueueItem?.roleId
  }
  return { actorSeatId, roleId }
}

function roleContinuityBroken(
  session: GameSessionState,
  item: WakeItem,
  entry: NightActionEntry | DayActionEntry,
) {
  const createdAt = sourceCreatedAt(session, entry)
  return session.timeline.some((candidate) => candidate.kind === 'setup_changed'
    && candidate.seatId === item.seatId
    && candidate.createdAt > createdAt)
}

function previousNightEntry(session: GameSessionState, item: WakeItem, sequence: number) {
  const entry = previousNightEntries(session, sequence)
    .find((candidate) => {
      const identity = nightEntryIdentity(session, candidate)
      return identity.actorSeatId === item.seatId
        && identity.roleId !== undefined
        && normalizeRoleId(identity.roleId) === normalizeRoleId(item.roleId)
    })
  return entry && !roleContinuityBroken(session, item, entry) ? entry : undefined
}

function priorRoleEntries(session: GameSessionState, item: WakeItem, sequence: number) {
  const sequenceBySegment = new Map(session.phaseSegments
    .filter((segment) => segment.kind === 'night')
    .map((segment) => [segment.id, segment.sequence]))
  return projectEffectiveTimelineEntries(session.timeline)
    .filter((candidate): candidate is NightActionEntry => {
      if (candidate.kind !== 'night_action') return false
      const entrySequence = candidate.segmentId ? sequenceBySegment.get(candidate.segmentId) : undefined
      if (entrySequence === undefined || entrySequence >= sequence) return false
      const identity = nightEntryIdentity(session, candidate)
      return identity.actorSeatId === item.seatId
        && identity.roleId !== undefined
        && normalizeRoleId(identity.roleId) === normalizeRoleId(item.roleId)
        && !roleContinuityBroken(session, item, candidate)
    })
    .sort((left, right) => {
      const leftSequence = sequenceBySegment.get(left.segmentId ?? '') ?? 0
      const rightSequence = sequenceBySegment.get(right.segmentId ?? '') ?? 0
      return rightSequence - leftSequence || right.createdAt.localeCompare(left.createdAt) || right.id.localeCompare(left.id)
    })
}

function previousRoleTypeRegistration(session: GameSessionState, item: WakeItem, sequence: number) {
  return previousNightEntry(session, item, sequence)?.record.snapshot.registration
}

function previousTargets(session: GameSessionState, item: WakeItem, sequence: number) {
  return previousNightEntry(session, item, sequence)?.record.snapshot.targets
}

interface MoonchildChoiceProjection {
  status: 'ready' | 'clear' | 'missing'
  seatId?: number
  registration?: StorytellerRegistrationSnapshot
  summary: string
}

function previousMoonchildChoice(session: GameSessionState, item: WakeItem, sequence: number): MoonchildChoiceProjection {
  const ids = segmentIds(session, 'day', sequence)
  const entry = projectEffectiveTimelineEntries(session.timeline)
    .filter((entry): entry is DayActionEntry => entry.kind === 'day_action' && ids.has(entry.segmentId ?? ''))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt) || right.id.localeCompare(left.id))
    .find((entry) => entry.skillContext?.abilityRole?.id
      && normalizeRoleId(entry.skillContext.abilityRole.id) === 'moonchild'
      && entry.skillContext.actor?.seatId === item.seatId)
  if (!entry || roleContinuityBroken(session, item, entry)) {
    return {
      status: 'missing',
      summary: '白天选择记录缺失或已被角色变化截断；不能从当前身份倒推月之子目标阵营。',
    }
  }
  const target = entry.skillContext?.targets[0]
  if (entry.skillContext?.outcome.kind === 'no_effect') {
    return {
      status: 'clear',
      seatId: target?.seatId,
      summary: target
        ? `白天选择：${target.seatId}号；记录结果为未生效，本夜不产生月之子死亡候选。`
        : '白天记录为未生效，且未记录目标；本夜不产生月之子死亡候选。',
    }
  }
  if (!target?.seatId) {
    return {
      status: 'missing',
      summary: '白天选择记录缺少目标；月之子死亡候选必须由说书人人工核对。',
    }
  }
  const registration = target.registration
  if (registration?.kind !== 'alignment') {
    return {
      status: 'missing',
      seatId: target.seatId,
      summary: `白天选择：${target.seatId}号；选择当刻阵营未记录，不能从当前身份倒推。`,
    }
  }
  if (registration.value === 'evil') {
    return {
      status: 'clear',
      seatId: target.seatId,
      registration,
      summary: `白天选择：${target.seatId}号；选择当刻登记为${registrationLabel(registration.value)}，本夜不产生月之子死亡候选。`,
    }
  }
  const states = projectCurrentPlayerStates(session)
  if (states[target.seatId]?.life === 'dead') {
    return {
      status: 'clear',
      seatId: target.seatId,
      registration,
      summary: `白天选择：${target.seatId}号；选择当刻登记为${registrationLabel(registration.value)}，但当前已死亡，不再生成新的死亡候选。`,
    }
  }
  return {
    status: 'ready',
    seatId: target.seatId,
    registration,
    summary: `白天选择：${target.seatId}号；选择当刻登记为${registrationLabel(registration.value)}，本夜仅生成死亡候选，仍需说书人确认。`,
  }
}

function registrationLabel(value: StorytellerRegistrationSnapshot['value']) {
  return ({ townsfolk: '镇民', outsider: '外来者', minion: '爪牙', demon: '恶魔', good: '善良', evil: '邪恶' })[value]
}

function moonchildOutcomes(projection: MoonchildChoiceProjection) {
  const registration = projection.registration
  if (projection.status === 'ready' && registration?.kind === 'alignment' && registration.value === 'good') return [{
    id: 'death-candidate', label: `${registration.seatId}号死亡候选`, requiredInputs: [],
    resultTemplate: `月之子白天选择的${registration.seatId}号在选择时登记为善良；仅记录死亡候选，仍需说书人另行确认状态。`,
  }]
  if (projection.status === 'clear') return [{
    id: 'no-death-candidate', label: '不产生死亡候选', requiredInputs: [],
    resultTemplate: `${projection.summary} 不自动修改状态。`,
  }]
  return [{
    id: 'manual-review', label: '登记待核对', requiredInputs: [],
    resultTemplate: '月之子白天选择时的阵营未记录；仅登记待核对，不自动产生死亡。',
  }]
}

function balloonistContext(session: GameSessionState, item: WakeItem, sequence: number): WakeItem {
  const registration = previousRoleTypeRegistration(session, item, sequence - 1)
  const actorImpaired = item.status.impairments.includes('poisoned') || item.status.impairments.includes('drunk')
  const status = sequence <= 1 || actorImpaired
    ? 'clear'
    : registration?.kind === 'role_type'
      ? 'ready'
      : 'missing'
  const summary = actorImpaired
    ? '气球驾驶员当前中毒或醉酒：可以给出不受上一夜类型限制的错误信息，但仍需明确登记本夜展示类型。'
    : sequence > 1
      ? registration?.kind === 'role_type'
        ? `上一夜登记：${registrationLabel(registration.value)}（${registration.seatId}号）；健康时本夜展示类型必须不同。`
        : '上一夜登记：未记录；不要从当前身份倒推，先人工核对上一夜展示类型。'
      : '首次行动：没有上一夜展示类型限制。'
  return {
    ...item,
    targetCount: 1,
    targetLabel: '目标',
    targetKind: 'storyteller_info',
    registrationSpec: {
      kind: 'role_type', label: '本夜展示类型', choices: [
        { id: 'townsfolk', label: '镇民' }, { id: 'outsider', label: '外来者' },
        { id: 'minion', label: '爪牙' }, { id: 'demon', label: '恶魔' },
      ],
    },
    previousRegistration: registration?.kind === 'role_type' ? registration : undefined,
    forbiddenRegistrationValues: status === 'ready' && registration?.kind === 'role_type' ? [registration.value] : undefined,
    history: summary,
    historicalContext: { kind: 'balloonist_role_type', status, seatIds: registration?.kind === 'role_type' ? [registration.seatId] : [], summary },
    outcomeOptions: [{
      id: 'record', label: '记录结果', requiredInputs: ['targets'],
      resultTemplate: '{actor}向玩家展示{targets}；本夜明确登记为{registration}。',
    }],
  }
}

function moonchildContext(session: GameSessionState, item: WakeItem, sequence: number): WakeItem {
  const projection = previousMoonchildChoice(session, item, sequence - 1)
  return {
    ...item,
    targetCount: 0,
    targetLabel: undefined,
    targetKind: undefined,
    previousRegistration: projection.registration?.kind === 'alignment' ? projection.registration : undefined,
    history: projection.summary,
    historicalContext: {
      kind: 'moonchild_choice',
      status: projection.status,
      seatIds: projection.seatId ? [projection.seatId] : [],
      summary: projection.summary,
    },
    outcomeOptions: moonchildOutcomes(projection),
  }
}

function previousTargetContext(session: GameSessionState, item: WakeItem, sequence: number, roleId: string): WakeItem {
  const targets = previousTargets(session, item, sequence - 1)
  const historyRequired = roleId === 'devilsadvocate' ? sequence > 1 : sequence > 2
  return {
    ...item,
    targetCount: 1,
    targetLabel: '目标',
    targetKind: 'player_choice',
    previousTargets: targets ? [...targets] : undefined,
    forbiddenTargetSeatIds: targets ? [...targets] : undefined,
    previousTargetRequired: historyRequired,
    history: historyRequired
      ? targets?.length
        ? `上一夜目标：${targets.map((seatId) => `${seatId}号`).join('、')}；本夜不可重复。`
        : '上一夜目标未记录；确认本夜目标前先人工核对。'
      : '首次行动：没有上一夜目标限制。',
    outcomeOptions: item.targetCount === 1 ? item.outcomeOptions : [{
      id: 'record', label: '记录结果', requiredInputs: ['targets'], resultTemplate: '{actor}本夜选择{targets}；仅记录候选效果。',
    }],
  }
}

function seatsLabel(seatIds: readonly number[]) {
  return seatIds.length ? seatIds.map((seatId) => `${seatId}号`).join('、') : '无'
}

function pukkaContext(session: GameSessionState, item: WakeItem, sequence: number): WakeItem {
  const entries = priorRoleEntries(session, item, sequence)
  let activeTarget: number | undefined
  let known = sequence === 1
  for (const entry of entries) {
    if (entry.record.snapshot.outcomeId === 'pukka-new-poison') {
      activeTarget = entry.record.snapshot.targets[0]
      known = entry.record.snapshot.targets.length === 1 && Boolean(activeTarget)
      break
    }
    if (entry.record.snapshot.outcomeId === 'pukka-old-resolved-no-new') {
      known = true
      break
    }
    if (entry.record.snapshot.outcomeId === 'pukka-no-new-poison') continue
    known = false
    break
  }
  const status = activeTarget ? 'ready' : known ? 'clear' : 'missing'
  const summary = activeTarget
    ? `当前待结算的普卡中毒目标：${activeTarget}号；死亡与恢复健康均为候选，需说书人确认。`
    : known
      ? '当前没有已确认的普卡中毒目标。'
      : '缺少最近一次普卡中毒是否生效的确认记录；请人工核对旧毒目标。'
  const oldEffect = activeTarget ? `${activeTarget}号为死亡并恢复健康候选；` : ''
  return {
    ...item,
    targetCount: 1,
    minimumTargetCount: 0,
    targetLabel: '本夜选择',
    targetKind: 'player_choice',
    history: summary,
    historicalContext: { kind: 'pukka_poison', status, seatIds: activeTarget ? [activeTarget] : [], summary },
    outcomeOptions: [
      {
        id: 'pukka-new-poison', label: '新毒目标生效', requiredInputs: ['targets'],
        resultTemplate: `${oldEffect}{targets}为新的中毒候选；仅记录候选，不自动修改状态。`,
      },
      {
        id: 'pukka-no-new-poison', label: '新毒未生效，旧毒保留', requiredInputs: ['targets'],
        resultTemplate: `{targets}未成为新的中毒目标；${activeTarget ? `${activeTarget}号旧毒继续保留` : '当前无已确认旧毒目标'}；仅记录结果。`,
      },
      {
        id: 'pukka-old-resolved-no-new', label: '旧毒结算，本夜无新毒', requiredInputs: [],
        resultTemplate: `${activeTarget ? `${activeTarget}号为死亡并恢复健康候选；` : '旧毒目标待人工核对；'}本夜没有新的中毒目标。`,
      },
    ],
  }
}

function shabalothContext(session: GameSessionState, item: WakeItem, sequence: number): WakeItem {
  const previous = previousNightEntry(session, item, sequence - 1)
  const previousTargets = previous?.record.snapshot.targets
  const required = sequence > 2
  const previousValid = Boolean(previous && previousTargets?.length === 2)
  const states = projectCurrentPlayerStates(session)
  const candidates = previousValid ? (previousTargets ?? []).filter((seatId) => states[seatId]?.life === 'dead') : []
  const status = required && !previousValid ? 'missing' : candidates.length ? 'ready' : 'clear'
  const summary = required
    ? previousValid
      ? `上一夜目标：${seatsLabel(previousTargets ?? [])}；当前可反刍候选：${seatsLabel(candidates)}。`
      : '缺少上一夜沙巴洛斯目标；反刍对象必须由说书人人工核对。'
    : '首次行动：没有上一夜反刍候选。'
  const options = [{
    id: 'shabaloth-no-regurgitation', label: '本夜不反刍', requiredInputs: ['targets' as const],
    resultTemplate: '{targets}为本夜死亡候选；本夜不记录反刍，状态仍由说书人确认。',
  }, ...candidates.map((seatId) => ({
    id: `shabaloth-regurgitate-${seatId}`, label: `反刍${seatId}号`, requiredInputs: ['targets' as const],
    resultTemplate: `{targets}为本夜死亡候选；${seatId}号为反刍复活候选，均需说书人确认状态。`,
  }))]
  if (status === 'missing') options.push({
    id: 'shabaloth-manual-review', label: '反刍待人工核对', requiredInputs: ['targets'],
    resultTemplate: '{targets}为本夜死亡候选；上一夜反刍对象缺失，已标记人工核对。',
  })
  return {
    ...item, targetCount: 2, targetLabel: '本夜两名目标', targetKind: 'player_choice',
    previousTargets: previousTargets ? [...previousTargets] : undefined,
    previousTargetRequired: required,
    history: summary,
    historicalContext: { kind: 'shabaloth_regurgitation', status, seatIds: candidates, summary },
    outcomeOptions: options,
  }
}

function yanluoContext(session: GameSessionState, item: WakeItem, sequence: number): WakeItem {
  const hasThirdNightFirstTarget = session.scriptId === 'zi-gui-qi-ming'
  const first = previousNightEntry(session, item, 1)
  const previous = previousNightEntry(session, item, sequence - 1)
  const requiredEntries = sequence === 1
    ? []
    : hasThirdNightFirstTarget && sequence === 2
      ? [first]
      : hasThirdNightFirstTarget && sequence === 3
        ? [first, previous]
        : [previous]
  const missing = requiredEntries.some((entry) => entry?.record.snapshot.targets.length !== 1)
  const candidates = hasThirdNightFirstTarget && sequence < 3
    ? []
    : sequence === 1
      ? []
      : [...new Set([
        ...(hasThirdNightFirstTarget && sequence === 3 ? first?.record.snapshot.targets ?? [] : []),
        ...(previous?.record.snapshot.targets ?? []),
      ])]
  const summary = sequence === 1
    ? hasThirdNightFirstTarget ? '首夜选择会延迟到第三夜成为死亡候选。' : '首夜选择会在下一夜成为死亡候选。'
    : missing
      ? '缺少阎罗历史目标；延迟死亡候选必须由说书人人工核对。'
      : hasThirdNightFirstTarget && sequence === 2
        ? `首夜目标${seatsLabel(first?.record.snapshot.targets ?? [])}将在第三夜进入死亡候选；本夜不提前结算。`
        : `本夜延迟死亡候选：${seatsLabel(candidates)}；不会自动修改生死状态。`
  return {
    ...item, targetCount: 1, targetLabel: '本夜目标', targetKind: 'player_choice',
    history: summary,
    historicalContext: {
      kind: 'yanluo_delayed_death', status: missing ? 'missing' : candidates.length ? 'ready' : 'clear',
      seatIds: candidates, summary,
    },
    outcomeOptions: [{
      id: 'yanluo-record', label: '记录目标与候选', requiredInputs: ['targets'],
      resultTemplate: `{targets}已记录为本夜目标；${candidates.length ? `${seatsLabel(candidates)}为延迟死亡候选` : sequence === 1 ? hasThirdNightFirstTarget ? '该目标将在第三夜进入死亡候选' : '该目标将在下一夜进入死亡候选' : '本夜没有已确认的延迟死亡候选'}；不自动修改状态。`,
    }],
  }
}

function poContext(session: GameSessionState, item: WakeItem, sequence: number): WakeItem {
  const entries = priorRoleEntries(session, item, sequence)
  let charged = false
  let known = sequence <= 2
  for (const entry of entries) {
    const outcomeId = entry.record.snapshot.outcomeId
    if (outcomeId === 'po-no-action') continue
    if (outcomeId === 'po-charge') {
      charged = entry.record.snapshot.targets.length === 0
      known = charged
      break
    }
    if (outcomeId === 'po-attack' || outcomeId === 'po-rampage') {
      known = entry.record.snapshot.targets.length === (outcomeId === 'po-rampage' ? 3 : 1)
      break
    }
    if (entry.record.snapshot.targets.length > 0) {
      known = true
      break
    }
    known = false
    break
  }
  const status = !known ? 'missing' : charged ? 'ready' : 'clear'
  const summary = !known
    ? '缺少珀上一次实际选择记录；请人工核对本夜应选一人还是三人。'
    : charged
      ? '上一次实际选择为无人：本夜必须依次选择三名玩家。'
      : sequence <= 2 ? '首次行动：可选择一名玩家，或明确选择无人进行蓄力。' : '上一次实际选择不是无人：本夜可选择一名玩家，或明确选择无人进行蓄力。'
  return charged ? {
    ...item, targetCount: 3, minimumTargetCount: 3, targetLabel: '三名目标', targetKind: 'player_choice', history: summary,
    historicalContext: { kind: 'po_charge', status, seatIds: [], summary },
    outcomeOptions: [{
      id: 'po-rampage', label: '记录三名目标', requiredInputs: ['targets'],
      resultTemplate: '{targets}为本夜三个死亡候选；仅记录候选，不自动修改状态。',
    }],
    aiAdviceEnabled: false,
  } : {
    ...item, targetCount: 1, minimumTargetCount: 0, targetLabel: '本夜选择', targetKind: 'player_choice', history: summary,
    historicalContext: { kind: 'po_charge', status, seatIds: [], summary },
    outcomeOptions: [
      { id: 'po-attack', label: '选择一名玩家', requiredInputs: ['targets'], resultTemplate: '{targets}为本夜死亡候选；不自动修改状态。' },
      { id: 'po-charge', label: '选择无人，进行蓄力', requiredInputs: [], resultTemplate: '珀本夜明确选择无人；下次实际行动必须选择三名玩家。' },
      { id: 'po-no-action', label: '本夜未行动（不蓄力）', requiredInputs: [], resultTemplate: '珀本夜没有实际行动；本夜不计作选择无人。' },
    ],
    aiAdviceEnabled: false,
  }
}

function isOncePerGameUse(entry: NightActionEntry) {
  const snapshot = entry.record.snapshot
  if (['skip', 'po-no-action', 'already-used'].includes(snapshot.outcomeId)) return false
  return snapshot.targets.length > 0 || Boolean(snapshot.roleChoice) || Boolean(snapshot.outcomeId)
}

function oncePerGameContext(session: GameSessionState, item: WakeItem, sequence: number): WakeItem {
  const usedEntry = priorRoleEntries(session, item, sequence).find(isOncePerGameUse)
  if (!usedEntry) {
    const summary = '本局尚未找到已确认的限次使用记录；若说书人确认此前已用过，请先追加历史更正。'
    return {
      ...item,
      history: item.history ? `${item.history} ${summary}` : summary,
      historicalContext: { kind: 'once_per_game_use', status: 'clear', seatIds: [], summary },
    }
  }
  const usedTargets = usedEntry.record.snapshot.targets
  const summary = `本局此前已记录该限次能力使用：${usedTargets.length ? seatsLabel(usedTargets) : '无目标记录'}；本夜不应由 AI 再推荐发动结果，需说书人人工核对。`
  return {
    ...item,
    applicability: 'needs_review',
    targetCount: 0,
    minimumTargetCount: 0,
    targetLabel: undefined,
    targetKind: undefined,
    previousTargets: usedTargets.length ? [...usedTargets] : undefined,
    history: summary,
    historicalContext: { kind: 'once_per_game_use', status: 'ready', seatIds: usedTargets, summary },
    outcomeOptions: [{
      id: 'already-used',
      label: '本局已用过，人工核对',
      requiredInputs: [],
      resultTemplate: summary,
    }],
    aiAdviceEnabled: false,
  }
}

export function applyWakeHistoricalContext(
  session: GameSessionState,
  item: WakeItem,
  sequence: number,
): WakeItem {
  const roleId = normalizeRoleId(item.roleId)
  if (roleId === 'balloonist') return balloonistContext(session, item, sequence)
  if (roleId === 'moonchild') return moonchildContext(session, item, sequence)
  if (roleId === 'pukka') return pukkaContext(session, item, sequence)
  if (roleId === 'shabaloth') return shabalothContext(session, item, sequence)
  if (roleId === 'yanluo') return yanluoContext(session, item, sequence)
  if (roleId === 'po') return poContext(session, item, sequence)
  if (previousTargetRoleIds.has(roleId)) return previousTargetContext(session, item, sequence, roleId)
  if (oncePerGameNightRoleIds.has(roleId)) return oncePerGameContext(session, item, sequence)
  return item
}

export function refreshNightRunHistoricalContext(session: GameSessionState, run: NightRunState) {
  const segment = run.phaseSegmentId
    ? session.phaseSegments.find((candidate) => candidate.id === run.phaseSegmentId)
    : undefined
  const sequence = segment?.sequence ?? Math.max(1, ...session.phaseSegments
    .filter((candidate) => candidate.kind === 'night')
    .map((candidate) => candidate.sequence + 1))
  return run.queue.map((item) => applyWakeHistoricalContext(session, item, sequence))
}
