import {
  createNightWorkbenchCommit,
  sessionInitialNightState,
  type NightWorkbenchSessionBinding,
} from '../../night-workbench/state/gameSessionAdapter'
import { nightWorkbenchReducer } from '../../night-workbench/state/nightWorkbenchReducer'
import type { NightWorkbenchState } from '../../night-workbench/types'

/**
 * 把环上的一次座位点击落进夜间草稿。
 *
 * 这里仍然只写草稿，不确认权威记录；确认仍在夜晚抽屉底栏完成。
 */
export function commitNightRingTarget(
  binding: NightWorkbenchSessionBinding,
  seatId: number,
  at = new Date().toISOString(),
): boolean {
  return commitNightRingTargetFromState(binding, sessionInitialNightState(binding), seatId, at).committed
}

/**
 * 与 commitNightRingTarget 相同，但允许调用方传入“上一点击后的最新本地夜晚状态”。
 *
 * 这用于桌面魔典环上的快速连续多目标点击：React session 还没来得及重渲染时，
 * 第二次点击必须基于第一次点击后的草稿继续算，不能从旧 session 重新算。
 */
export function commitNightRingTargetFromState(
  binding: NightWorkbenchSessionBinding,
  state: NightWorkbenchState,
  seatId: number,
  at = new Date().toISOString(),
): { committed: boolean; next: NightWorkbenchState } {
  if (!binding.session.seats[seatId]) return { committed: false, next: state }

  const next = nightWorkbenchReducer(state, { type: 'target', seatId, at })
  if (next === state) return { committed: false, next }
  binding.dispatchSession(createNightWorkbenchCommit(next, binding))
  return { committed: true, next }
}
