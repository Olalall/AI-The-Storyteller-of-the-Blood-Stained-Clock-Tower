import type { GameSessionState, PlayerState } from '../types'
import { projectCurrentPlayerStates } from './projectors'
import type { GameSessionAction } from './sessionActions'
import { hasTimelineId } from './sessionReducerGuards'

export function confirmPlayerStateChange(
  state: GameSessionState,
  action: Extract<GameSessionAction, { type: 'confirm-player-state-change' }>,
) {
  if (!state.seats[action.seatId] || hasTimelineId(state, action.entryId)) return state
  if (action.segmentId !== null && !state.phaseSegments.some((segment) => segment.id === action.segmentId && !segment.closedAt)) return state

  const before = projectCurrentPlayerStates(state)[action.seatId]
  if (!before || !samePlayerState(before, action.expectedBefore) || samePlayerState(before, action.after)) return state
  if (action.revertOf !== undefined && !canRevert(state, action.revertOf)) return state

  return {
    ...state,
    timeline: [...state.timeline, {
      id: action.entryId,
      kind: 'player_state_changed' as const,
      segmentId: action.segmentId,
      createdAt: action.confirmedAt,
      confirmedBy: 'storyteller' as const,
      seatId: action.seatId,
      before: clonePlayerState(before),
      after: clonePlayerState(action.after),
      reason: action.reason,
      // 条件展开而不是直接赋值：旧路径不带这些字段，写成 `ops: undefined`
      // 会让每一条历史记录都多出四个空键，归档体积和 diff 噪声都跟着涨。
      ...(action.ops ? { ops: action.ops } : {}),
      ...(action.origin ? { origin: action.origin } : {}),
      ...(action.batchId ? { batchId: action.batchId } : {}),
      ...(action.backfill ? { backfill: action.backfill } : {}),
      ...(action.revertOf ? { revertOf: action.revertOf } : {}),
    }],
  }
}


/**
 * 一条记录只能被撤销一次，且只能撤销真实存在的状态变更。
 *
 * 不挡第二次的话，两次撤销都会「成功」——第二条把状态又写回撤销前，
 * 于是屏幕上的局面在说书人眼里毫无征兆地跳了回去，而两条记录看起来都合法。
 * 撤销的撤销同样不放行：那不是撤销，是一次新的状态变更，该走正常路径留下正常理由。
 */
function canRevert(state: GameSessionState, revertOf: string): boolean {
  const target = state.timeline.find((entry) => entry.id === revertOf)
  if (!target || target.kind !== 'player_state_changed') return false
  if (target.revertOf !== undefined) return false
  return !state.timeline.some((entry) => entry.kind === 'player_state_changed' && entry.revertOf === revertOf)
}

/**
 * 逐字段递归，而不是只拷 markers：座位状态将来会长出更多字段（标记归属、身份附加层等），
 * 漏拷的字段会在 before/after 之间共享引用，让审计链上的「改动前」被后续改动就地篡改。
 */
function clonePlainData<T>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => clonePlainData(item)) as unknown as T
  if (value && typeof value === 'object') {
    const cloned: Record<string, unknown> = {}
    for (const [key, item] of Object.entries(value)) cloned[key] = clonePlainData(item)
    return cloned as T
  }
  return value
}

/**
 * 同理必须逐字段比较：只比 life/poisoned/drunk 与 markers 的 id+label 时，
 * 任何其他字段的单独变更都会被判为「没变化」而整条静默拒绝——在牌桌上表现为点了没反应。
 * 缺失键与显式 undefined 视为相等，这样新增可选字段不会把旧存档判成「有变化」。
 */
function deepEqualPlainData(left: unknown, right: unknown): boolean {
  if (left === right) return true
  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false
    return left.every((item, index) => deepEqualPlainData(item, right[index]))
  }
  if (left && right && typeof left === 'object' && typeof right === 'object') {
    const definedKeys = (value: object) => Object.keys(value)
      .filter((key) => (value as Record<string, unknown>)[key] !== undefined)
    const leftKeys = definedKeys(left)
    const rightKeys = definedKeys(right)
    if (leftKeys.length !== rightKeys.length) return false
    return leftKeys.every((key) => deepEqualPlainData(
      (left as Record<string, unknown>)[key],
      (right as Record<string, unknown>)[key],
    ))
  }
  return false
}

function clonePlayerState(state: PlayerState): PlayerState {
  return clonePlainData(state)
}

function samePlayerState(left: PlayerState, right: PlayerState) {
  return deepEqualPlainData(left, right)
}


