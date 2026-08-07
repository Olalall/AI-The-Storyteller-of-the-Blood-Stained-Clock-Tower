/**
 * 环上点座位 → 夜间草稿。
 *
 * 这里刻意**不**自己算「下一刻的 targets 是什么」，而是把意图交给夜间工作台原来那个
 * reducer 去跑。自己算的话，环与抽屉会各持一份「点第四个人时顶掉谁」的规则，
 * 而它们迟早不一致——不一致的那一刻，说书人看到的描边和落账的目标是两回事。
 *
 * 落的是**草稿**：nightWorkbenchReducer 的 target 分支只动 drafts，
 * 确认仍然在抽屉底栏。环上点一百下也不会产生一条确认记录。
 */
import {
  createNightWorkbenchCommit,
  sessionInitialNightState,
  type NightWorkbenchSessionBinding,
} from '../../night-workbench/state/gameSessionAdapter'
import { nightWorkbenchReducer } from '../../night-workbench/state/nightWorkbenchReducer'

/**
 * 把一次环上的点击落进草稿。
 *
 * 返回是否真的写了：没写时调用方要给一句话（「本项不点目标」这类），
 * 因为按下去毫无反应是本工具里最坏的一种反馈——说书人会以为自己点上了。
 */
export function commitNightRingTarget(
  binding: NightWorkbenchSessionBinding,
  seatId: number,
  /** 时钟停在调用方：reducer 必须可重放，自己取 now 会让同一组输入产生不同结果。 */
  at = new Date().toISOString(),
): boolean {
  // 座位得真的存在。reducer 的 target 分支不校验这个——它假设调用方给的是
  // 队列里点出来的号码。环确实只给得出真座位，但这个函数是公开的，
  // 一个越界号码会静默落进草稿，然后在确认时变成一条指向无人座位的记录。
  if (!binding.session.seats[seatId]) return false

  const state = sessionInitialNightState(binding)
  const next = nightWorkbenchReducer(state, { type: 'target', seatId, at })
  // reducer 用「同一引用即无变化」表达拒绝，守卫挡下的点击在这里原样返回 false。
  if (next === state) return false
  binding.dispatchSession(createNightWorkbenchCommit(next, binding))
  return true
}
