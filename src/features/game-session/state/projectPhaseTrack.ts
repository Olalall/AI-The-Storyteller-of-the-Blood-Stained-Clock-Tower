import type { GameSessionState } from '../types'

export type PhaseNodeId = 'dusk' | 'night' | 'dawn' | 'day' | 'vote' | 'execution'

/**
 * done    该步在本轮已经发生过
 * open    对应的记录段当前开放（白天段与夜晚段允许同时开放）
 * suggest 建议的下一步——只是高亮，不是权威指针，也不推进任何东西
 * idle    本轮尚未轮到
 */
export type PhaseNodeStatus = 'done' | 'open' | 'suggest' | 'idle'

export interface PhaseTrackNode {
  id: PhaseNodeId
  label: string
  status: PhaseNodeStatus
  /** 「第3夜」这类段落标签；只有夜/白天两个节点有真实记录段。 */
  segmentLabel?: string
}

const NODE_LABELS: Record<PhaseNodeId, string> = {
  dusk: '黄昏',
  night: '夜',
  dawn: '黎明',
  day: '白天',
  vote: '提名投票',
  execution: '处决',
}

const ORDER: readonly PhaseNodeId[] = ['dusk', 'night', 'dawn', 'day', 'vote', 'execution']

/**
 * 轨道只描述「已经发生了什么、现在哪些段开着、建议下一步是什么」，
 * 不创建记录段、不关闭记录段、不改变阶段。相位推进的唯一入口仍是说书人的显式确认。
 *
 * 刻意不做成单一线性指针：昼夜记录段合同允许一个白天段与一个夜晚段同时开放，
 * 好让说书人按现场情况自由补记；把它压成一个指针会逼着界面说谎。
 */
export function projectPhaseTrack(session: GameSessionState): readonly PhaseTrackNode[] {
  const openNight = session.phaseSegments.find((segment) => segment.kind === 'night' && !segment.closedAt)
  const openDay = session.phaseSegments.find((segment) => segment.kind === 'day' && !segment.closedAt)
  const anyNight = session.phaseSegments.some((segment) => segment.kind === 'night')
  const anyDay = session.phaseSegments.some((segment) => segment.kind === 'day')

  const currentDayId = openDay?.id
  const dayEntries = currentDayId
    ? session.timeline.filter((entry) => entry.segmentId === currentDayId)
    : []
  const hasVote = dayEntries.some((entry) => entry.kind === 'vote_round')
  const hasResolution = dayEntries.some((entry) => entry.kind === 'execution' || entry.kind === 'no_execution')

  // 两个段都开着时，用最近创建的那个决定「建议下一步」落在哪一侧。
  const newerOpen = openNight && openDay
    ? (openNight.createdAt.localeCompare(openDay.createdAt) >= 0 ? 'night' : 'day')
    : openNight ? 'night' : openDay ? 'day' : null

  const status: Record<PhaseNodeId, PhaseNodeStatus> = {
    dusk: anyNight || openNight ? 'done' : 'suggest',
    night: openNight ? 'open' : anyNight ? 'done' : 'idle',
    dawn: openNight ? 'idle' : anyNight ? 'done' : 'idle',
    day: openDay ? 'open' : anyDay ? 'done' : 'idle',
    vote: hasVote ? (hasResolution ? 'done' : 'open') : 'idle',
    execution: hasResolution ? 'done' : 'idle',
  }

  if (newerOpen === 'night') {
    status.dawn = 'suggest'
  } else if (newerOpen === 'day') {
    if (!hasVote) status.vote = 'suggest'
    else if (!hasResolution) status.execution = 'suggest'
  } else if (anyDay || anyNight) {
    // 没有开放段：下一步是进入下一个黄昏。
    status.dusk = 'suggest'
  }

  return ORDER.map((id) => ({
    id,
    label: NODE_LABELS[id],
    status: status[id],
    segmentLabel: id === 'night' ? openNight?.label : id === 'day' ? openDay?.label : undefined,
  }))
}
