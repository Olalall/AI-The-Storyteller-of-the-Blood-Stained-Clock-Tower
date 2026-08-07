/**
 * 夜间工作台的派生状态与唯一 dispatch 入口。
 *
 * 它住在 hooks/ 而不是 state/，理由和 useNightAIAdvice 一样：state/ 必须保持纯。
 * 时钟就停在这里——组件只发不带时间的意图，由这里盖上 `at` 再交给 reducer，
 * 于是同一组 (state, action) 永远得出同一个 state，归档才回放得出来。
 */
import { useCallback } from 'react'
import { emptyWakeDraft } from '../state/projectWakeDraft'
import { currentRoleForItem, latestRoleChange } from '../state/roleChanges'
import {
  createNightWorkbenchCommit,
  sessionInitialNightState,
  type NightWorkbenchSessionBinding,
} from '../state/gameSessionAdapter'
import { nightWorkbenchReducer, type NightWorkbenchIntent } from '../state/nightWorkbenchReducer'
import { canConfirmDraft } from '../state/workbenchGuards'
import { deriveWorkbenchMode, isReadOnlyMode } from '../state/workbenchMode'

export type { NightWorkbenchSessionBinding } from '../state/gameSessionAdapter'

export function useNightWorkbench(binding: NightWorkbenchSessionBinding) {
  const state = sessionInitialNightState(binding)
  // 时钟停在这里：dispatch 是 reducer 的调用方，由它给意图盖上时间戳。
  // reducer 内部一律不取时钟，所以同一组 (state, action) 永远得到同一个 state，归档才回放得出来。
  const dispatch = useCallback((intent: NightWorkbenchIntent) => {
    const nextState = nightWorkbenchReducer(state, { ...intent, at: new Date().toISOString() })
    if (nextState === state) return
    binding.dispatchSession(createNightWorkbenchCommit(nextState, binding))
  }, [binding, state])

  const previewIndex = state.queue.findIndex((item) => item.id === state.previewEntryId)
  const activeIndex = state.queue.findIndex((item) => item.id === state.activeCursorId)
  const current = state.queue[previewIndex]
  const draft = state.drafts[current.id] ?? emptyWakeDraft()
  const completed = state.queue.filter((item) => item.progress === 'confirmed').length
  const needsReview = state.queue.filter((item) => item.applicability === 'needs_review').length
  const deferred = state.queue.filter((item) => item.progress === 'deferred').length
  // 这一屏「现在是什么状态」的唯一真值。旧的 isPreviewing / isReadOnly / isCorrecting
  // 三个并列布尔全部由它派生，对照表见 workbenchMode.ts。
  const mode = deriveWorkbenchMode(state, current)
  // 唯一的只读判据，只在这里算一次，之后一路作为 readOnly prop 往下传；
  // 组件不得自行判断能不能写——归档回看的写入禁用将来也走这同一条路。
  const readOnly = isReadOnlyMode(mode)
  const canConfirm = canConfirmDraft(state, current, draft)
  const previous = state.queue[previewIndex - 1]
  const next = state.queue[previewIndex + 1]
  const currentRole = currentRoleForItem(current, state.roleChangeEvents)

  return {
    state,
    dispatch,
    current,
    draft,
    previewIndex,
    activeIndex,
    completed,
    needsReview,
    deferred,
    mode,
    readOnly,
    canConfirm,
    currentRole,
    currentRoleChange: latestRoleChange(state.roleChangeEvents, current.seatId),
    previousRole: previous ? currentRoleForItem(previous, state.roleChangeEvents) : undefined,
    nextRole: next ? currentRoleForItem(next, state.roleChangeEvents) : undefined,
    previous,
    next,
  }
}
