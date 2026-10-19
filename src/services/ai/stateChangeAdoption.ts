/**
 * 把一条 AI 状态建议翻译成一次说书人自己的状态变更。
 *
 * 为什么在 services/ai 而不是组件旁边：一是组件文件只允许导出组件（oxlint
 * react/only-export-components），纯函数挤在里面就没法单测；二是放在这里能白拿一道护栏——
 * verify-architecture 的 state-no-ai-import 禁止任何 features/＊/state 目录 import
 * services/ai，于是「哪天有人在 reducer 里直接把 AI 建议展开成写入」这条路径在 CI 上就是红的。
 *
 * 边界：这里**不是**把 provider 返回值搬进 dispatch。函数签名强制要求传入当前局面的
 * 权威 PlayerState，落盘用的 before/after 全部由它算出；AI 那边只提供三样东西——
 * 改哪个座位、改哪个字段（已过白名单）、以及那句给人看的话（进 reason 当溯源）。
 */
import type { GrimoireOp } from '../../features/game-session/model/grimoireOp'
import type { PlayerState } from '../../features/game-session/model/playerTypes'
import type { GameSessionAction } from '../../features/game-session/state/sessionActions'
import type { AIResultAdvice, AIStateChangeDraft } from '../../features/night-workbench/types'

/**
 * 采纳一条建议所需的**权威**信息。
 *
 * playerStates 必须来自当前局面投影，不能来自建议本身：expectedBefore 是乐观锁，
 * 让 AI 顺带把「改之前是什么」也说了，等于让它自己给自己签收。
 */
export interface StateChangeAdoptionContext {
  playerStates: Readonly<Record<number, PlayerState>>
  segmentId: string | null
}

export interface ProjectedStateChange {
  seatId: number
  before: PlayerState
  after: PlayerState
  op: GrimoireOp
  /** 按钮上给说书人看的一眼预览，避免他在不知道会写什么的情况下点确认。 */
  label: string
}

/**
 * 这条建议若落盘会把这个座位改成什么。返回 null = 没有可落盘的东西，按钮不出现。
 *
 * 四种 null 都是有意的：没 seatId / 没 change（AI 只说了句人话）、座位不在当前局面里、
 * 以及**落盘后与现状完全相同**。最后一种最容易被漏掉：放过去会写出一条 before 与 after
 * 相同的记录，它在时间线上看起来像说书人做过一次操作，而实际什么都没发生
 * （grimoireOpInvariant 会判 no_change）。
 */
export function projectStateChangeAdoption(
  draft: AIStateChangeDraft,
  playerStates: Readonly<Record<number, PlayerState>>,
): ProjectedStateChange | null {
  const { seatId, change } = draft
  if (seatId === undefined || !change) return null
  const before = playerStates[seatId]
  if (!before) return null

  if (change.field === 'life') {
    const life = change.to === 'dead' ? 'dead' : 'alive'
    if (before.life === life) return null
    return {
      seatId,
      before,
      after: { ...before, life },
      op: { op: 'life_set', seatId, life },
      label: `${seatId}号 生死→${life === 'dead' ? '死亡' : '存活'}`,
    }
  }

  if (change.field === 'poisoned' || change.field === 'drunk') {
    const value = change.to === 'true'
    if (before[change.field] === value) return null
    return {
      seatId,
      before,
      // 写成两个字面量而不是计算键：计算键会把 after 的类型放宽成索引签名，
      // 「改醉酒时顺手把中毒也写了」这类笔误就不再是编译错误。
      after: change.field === 'poisoned' ? { ...before, poisoned: value } : { ...before, drunk: value },
      op: { op: 'impairment_set', seatId, impairment: change.field, value },
      label: `${seatId}号 ${change.field === 'poisoned' ? '中毒' : '醉酒'}→${value ? '是' : '否'}`,
    }
  }

  const markerLabel = change.markerLabel ?? ''
  if (!markerLabel) return null
  if (change.to === 'add') {
    // 同名标记已经在上面时不再加第二枚：说书人真想要两枚同名标记，那是一次手动操作，
    // 不该由「AI 又建议了一次」造出来。
    if (before.markers.some((marker) => marker.label === markerLabel)) return null
    const token = { id: `ai-${seatId}-${markerLabel}`, label: markerLabel }
    return {
      seatId,
      before,
      after: { ...before, markers: [...before.markers, token] },
      op: { op: 'token_added', seatId, token },
      label: `${seatId}号 标记+${markerLabel}`,
    }
  }

  const target = before.markers.find((marker) => marker.label === markerLabel)
  if (!target) return null
  return {
    seatId,
    before,
    after: { ...before, markers: before.markers.filter((marker) => marker.id !== target.id) },
    op: { op: 'token_removed', seatId, tokenId: target.id, tokenLabel: target.label },
    label: `${seatId}号 标记−${markerLabel}`,
  }
}

/**
 * 构造 confirm-player-state-change。
 *
 * ops 恒为一条（裁决 4）：放宽到多条，「加中毒标记」和「置 poisoned=true」就能合法地
 * 待在同一条 entry 里，级联写入从此有了通过评审的外壳。
 */
export function buildStateChangeAdoption(
  advice: Pick<AIResultAdvice, 'adviceId'>,
  draft: AIStateChangeDraft,
  context: StateChangeAdoptionContext,
  confirmedAt: string,
): GameSessionAction | null {
  const projected = projectStateChangeAdoption(draft, context.playerStates)
  if (!projected) return null
  return {
    type: 'confirm-player-state-change',
    seatId: projected.seatId,
    expectedBefore: projected.before,
    after: projected.after,
    segmentId: context.segmentId,
    entryId: `ai-adopt-${advice.adviceId}-${projected.seatId}-${confirmedAt}`,
    confirmedAt,
    // adviceId 进 reason 是唯一的溯源位置：PlayerStateChangedEntry 上没有 adviceId 字段，
    // 裁决 3 也明说不新建字段。这行字决定了复盘时能不能回答「这条是采纳自哪句建议」。
    reason: `采纳AI建议(${advice.adviceId})：${draft.text}`,
    ops: [projected.op],
    origin: 'night_workbench',
  }
}
