import type { NightWorkbenchState } from '../types'
import { emptyWakeDraft } from '../state/projectWakeDraft'
import { catfishingRoleSnapshots, sampleOtherNightQueue } from './catfishing'

/**
 * 仅用于把早期夜间原型迁移进统一的 GameSession。
 * 新代码不得向这个 key 写入任何状态。
 */
export const legacyNightWorkbenchStorageKey = 'botc-copilot-night-prototype-v5'

const baselineConfirmedRecords: NightWorkbenchState['confirmedRecords'] = {
  'night-3-philosopher': [{
    id: 'night-3-philosopher-baseline',
    wakeItemId: 'night-3-philosopher',
    revision: 1,
    confirmedAt: '2026-07-13T00:00:00.000Z',
    snapshot: { ...emptyWakeDraft(), outcomeId: 'hold', storytellerResult: '7号哲学家本夜不发动能力。' },
  }],
  'night-3-gambler': [{
    id: 'night-3-gambler-baseline',
    wakeItemId: 'night-3-gambler',
    revision: 1,
    confirmedAt: '2026-07-13T00:01:00.000Z',
    snapshot: { ...emptyWakeDraft(), targets: [9], roleChoice: 'lunatic', outcomeId: 'correct', playerChoice: '选择9号 · 猜测：疯子', storytellerResult: '6号赌徒猜测9号是疯子：正确。' },
  }],
  'night-3-snakecharmer': [{
    id: 'night-3-snakecharmer-baseline',
    wakeItemId: 'night-3-snakecharmer',
    revision: 1,
    confirmedAt: '2026-07-13T00:02:00.000Z',
    snapshot: { ...emptyWakeDraft(), targets: [2], outcomeId: 'miss', playerChoice: '选择2号', storytellerResult: '5号舞蛇人选择2号，没有发生交换。' },
  }],
}

const roleById = new Map(catfishingRoleSnapshots.map((role) => [role.id, role]))
const prototypeRoleIds = [
  'drunk',
  'balloonist',
  'dreamer',
  'fortuneteller',
  'snakecharmer',
  'gambler',
  'philosopher',
  'recluse',
  'lunatic',
  'cerenovus',
  'pithag',
  'fanggu',
]
const prototypeStatusBySeat = new Map(sampleOtherNightQueue.map((item) => [item.seatId, item.status]))

const prototypeSeatSnapshots: NightWorkbenchState['seatSnapshots'] = Object.fromEntries(
  prototypeRoleIds.map((roleId, index) => {
    const seatId = index + 1
    const role = roleById.get(roleId)
    return [seatId, {
      seatId,
      playerLabel: `${seatId}号 · 玩家${seatId}`,
      nickname: `玩家${seatId}`,
      role: role ? { ...role } : null,
      status: prototypeStatusBySeat.get(seatId) ?? { life: 'alive', impairments: [], markers: [] },
    }]
  }),
) as NightWorkbenchState['seatSnapshots']

export const initialNightWorkbenchState: NightWorkbenchState = {
  nightRunId: 'prototype-catfishing-night-3',
  scriptId: 'catfishing',
  nightLabel: '第3夜',
  nightType: 'other',
  playerCount: 12,
  revision: 4,
  knowledgeVersion: 'catfishing-11.1.1+nightsheet-99a2815b',
  queue: sampleOtherNightQueue,
  seatSnapshots: prototypeSeatSnapshots,
  activeCursorId: sampleOtherNightQueue[3].id,
  previewEntryId: sampleOtherNightQueue[3].id,
  drafts: {},
  privacyShielded: false,
  dimmed: false,
  aiAdviceLog: {},
  correctionItemId: null,
  confirmedRecords: baselineConfirmedRecords,
  roleChangeEvents: [],
  lastNotice: '已恢复第3夜的夜序快照',
}
