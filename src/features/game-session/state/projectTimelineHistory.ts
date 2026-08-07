import type { GameSessionState, TimelineEntry } from '../types'
import { assertNever } from '../../../shared/assertNever'
import { formatDaySkillDetails, formatDaySkillSummary } from '../daySkillPresentation'

export type TimelineHistoryCategory =
  | 'night_action'
  | 'day_skill'
  | 'public_event'
  | 'vote_round'
  | 'execution'
  | 'player_state'
  | 'role_change'
  | 'setup'

export interface TimelineHistoryEntry {
  id: string
  source: TimelineEntry
  phaseKey: string
  phaseLabel: string
  createdAt: string
  category: TimelineHistoryCategory
  categoryLabel: string
  summary: string
  details: string[]
  seatIds: number[]
  correctionOf?: string
  isCorrection: boolean
  isSuperseded: boolean
  canCorrect: boolean
  correctionHelp?: string
}

export interface TimelineHistoryFilters {
  phaseKey: string
  seatId: number | null
  category: TimelineHistoryCategory | 'all'
}

const categoryLabel: Record<TimelineHistoryCategory, string> = {
  night_action: '夜间行动',
  day_skill: '白天技能',
  public_event: '公开事件',
  vote_round: '投票',
  execution: '日终',
  player_state: '状态',
  role_change: '角色调整',
  setup: '配板',
}

interface TimelineHistoryFieldSet {
  category: TimelineHistoryCategory
  summary: string
  details: string[]
  seatIds: number[]
}

function uniqueSeatIds(values: Array<number | null | undefined>) {
  return [...new Set(values.filter((value): value is number => typeof value === 'number' && Number.isInteger(value) && value > 0))]
    .sort((left, right) => left - right)
}

function phaseInfo(session: GameSessionState, entry: TimelineEntry) {
  if (entry.segmentId) {
    const segment = session.phaseSegments.find((candidate) => candidate.id === entry.segmentId)
    if (segment) return { phaseKey: `segment:${segment.id}`, phaseLabel: segment.label }
  }
  if (entry.kind === 'setup_confirmed' || entry.kind === 'setup_changed') return { phaseKey: 'setup', phaseLabel: '配板' }
  return { phaseKey: 'session', phaseLabel: '本局' }
}

function stateLabel(entry: Extract<TimelineEntry, { kind: 'player_state_changed' }>) {
  return [entry.after.life === 'dead' ? '死亡' : '存活', entry.after.poisoned ? '中毒' : '', entry.after.drunk ? '醉酒' : '']
    .filter(Boolean)
    .join(' · ')
}

/**
 * 显式声明返回类型，新增 timeline kind 时缺分支会直接在本函数报 TS2366，
 * 而不是让调用方拿到 undefined 后在字段访问处才炸。
 */
function historyFields(session: GameSessionState, entry: TimelineEntry): TimelineHistoryFieldSet {
  switch (entry.kind) {
    case 'setup_confirmed':
      return {
        category: 'setup' as const,
        summary: '配板已确认',
        details: [`${entry.setup.draft.assignments.length}个座位已确认`],
        seatIds: entry.setup.draft.assignments.map((assignment) => assignment.seatId),
      }
    case 'setup_changed':
      return {
        category: 'role_change' as const,
        summary: `${entry.seatId}号角色：${entry.fromRole.name} → ${entry.toRole.name}`,
        details: [`原因：${entry.reason}`, '从后续工作台起生效'],
        seatIds: [entry.seatId],
      }
    case 'player_state_changed':
      return {
        category: 'player_state' as const,
        summary: `${entry.seatId}号状态：${stateLabel(entry)}`,
        details: [entry.reason],
        seatIds: [entry.seatId],
      }
    case 'night_action': {
      const wakeItem = session.nightRuns[entry.nightRunId]?.queue.find((item) => item.id === entry.wakeItemId)
      const actor = wakeItem ? `${wakeItem.seatId}号 · ${wakeItem.roleName}` : '夜间行动'
      return {
        category: 'night_action' as const,
        summary: entry.summary,
        details: [
          `行动者：${actor}`,
          entry.record.snapshot.targets.length ? `目标：${entry.record.snapshot.targets.join('、')}号` : '',
          entry.record.snapshot.playerChoice ? `选择：${entry.record.snapshot.playerChoice}` : '',
          entry.record.snapshot.informationGiven ? `告知：${entry.record.snapshot.informationGiven}` : '',
        ].filter(Boolean),
        seatIds: uniqueSeatIds([wakeItem?.seatId, ...entry.record.snapshot.targets]),
      }
    }
    case 'day_action': {
      const isSkill = entry.category === 'skill'
      return {
        category: isSkill ? 'day_skill' as const : 'public_event' as const,
        summary: isSkill
          ? formatDaySkillSummary(entry.skillContext, entry.actorSeatId, entry.targetSeatIds)
          : entry.summary,
        details: isSkill
          ? [...formatDaySkillDetails(entry.skillContext, entry.actorSeatId, entry.targetSeatIds), ...entry.details]
          : [
            entry.targetSeatIds.length ? `涉及玩家：${entry.targetSeatIds.join('、')}号` : '',
            ...entry.details,
          ].filter(Boolean),
        seatIds: uniqueSeatIds([entry.actorSeatId, ...entry.targetSeatIds]),
      }
    }
    case 'vote_round':
      return {
        category: 'vote_round' as const,
        summary: `${entry.nominatorSeatId}号提名${entry.nomineeSeatId}号 · ${entry.raisedSeatIds.length}票`,
        details: [
          `门槛：${entry.threshold}票`,
          `举手：${entry.raisedSeatIds.length ? `${entry.raisedSeatIds.join('、')}号` : '0票'}`,
          entry.ghostVoteSeatIds.length ? `死亡票：${entry.ghostVoteSeatIds.join('、')}号` : '',
        ].filter(Boolean),
        seatIds: uniqueSeatIds([entry.nominatorSeatId, entry.nomineeSeatId, ...entry.raisedSeatIds, ...entry.ghostVoteSeatIds]),
      }
    case 'execution':
      return {
        category: 'execution' as const,
        summary: `确认处决${entry.executedSeatId}号`,
        details: ['玩家状态会由专用日终记录同步'],
        seatIds: uniqueSeatIds([entry.executedSeatId]),
      }
    case 'no_execution':
      return {
        category: 'execution' as const,
        summary: '确认无处决',
        details: [],
        seatIds: [],
      }
  }
}

function correctionHelp(entry: TimelineEntry, isSuperseded: boolean) {
  if (isSuperseded) return '这条记录已有更新，请在最新版本上继续更正。'
  switch (entry.kind) {
    case 'night_action':
    case 'day_action':
      return undefined
    case 'vote_round':
      return '票型影响暂列结果；从白天工作台重新记录。'
    case 'player_state_changed':
      return '状态影响当前局面；从玩家状态板追加状态记录。'
    case 'execution':
    case 'no_execution':
      return '日终与玩家状态需保持一致；从白天工作台调整。'
    case 'setup_confirmed':
    case 'setup_changed':
      return '身份与配板调整从配板面板操作。'
    default:
      // 未知 kind 沿用配板兜底文案，与穷尽检查加入前一致。
      assertNever(entry)
      return '身份与配板调整从配板面板操作。'
  }
}

/** 审计视图保留全链；当前局面投影只消费每条链的最后一版。 */
export function projectEffectiveTimelineEntries(entries: readonly TimelineEntry[]) {
  const supersededIds = new Set(entries.flatMap((entry) => entry.correctionOf ? [entry.correctionOf] : []))
  return entries.filter((entry) => !supersededIds.has(entry.id))
}

export function projectTimelineHistory(session: GameSessionState): TimelineHistoryEntry[] {
  const supersededIds = new Set(session.timeline.flatMap((entry) => entry.correctionOf ? [entry.correctionOf] : []))
  return session.timeline
    .map((source) => {
      const fields = historyFields(session, source)
      const phase = phaseInfo(session, source)
      const isSuperseded = supersededIds.has(source.id)
      const details = source.correctionOf
        ? [...fields.details, `更正原因：${source.correctionReason?.trim() || '历史记录未填写原因'}`]
        : fields.details
      return {
        id: source.id,
        source,
        ...phase,
        createdAt: source.createdAt,
        category: fields.category,
        categoryLabel: categoryLabel[fields.category],
        summary: fields.summary,
        details,
        seatIds: fields.seatIds,
        correctionOf: source.correctionOf,
        isCorrection: Boolean(source.correctionOf),
        isSuperseded,
        canCorrect: !isSuperseded && (source.kind === 'night_action' || source.kind === 'day_action'),
        correctionHelp: correctionHelp(source, isSuperseded),
      }
    })
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt) || right.id.localeCompare(left.id))
}

export function filterTimelineHistory(entries: readonly TimelineHistoryEntry[], filters: TimelineHistoryFilters) {
  return entries.filter((entry) =>
    (filters.phaseKey === 'all' || entry.phaseKey === filters.phaseKey) &&
    (filters.seatId === null || entry.seatIds.includes(filters.seatId)) &&
    (filters.category === 'all' || entry.category === filters.category),
  )
}

export function projectCorrectionChain(entries: readonly TimelineHistoryEntry[], selectedEntryId: string) {
  const byId = new Map(entries.map((entry) => [entry.id, entry]))
  let rootId = selectedEntryId
  let current = byId.get(rootId)
  while (current?.correctionOf && byId.has(current.correctionOf)) {
    rootId = current.correctionOf
    current = byId.get(rootId)
  }

  const chainIds = new Set([rootId])
  let appended = true
  while (appended) {
    appended = false
    for (const entry of entries) {
      if (entry.correctionOf && chainIds.has(entry.correctionOf) && !chainIds.has(entry.id)) {
        chainIds.add(entry.id)
        appended = true
      }
    }
  }
  return entries
    .filter((entry) => chainIds.has(entry.id))
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt) || left.id.localeCompare(right.id))
}
