/**
 * 「此刻点环上一个座位等于什么」的纯映射。
 *
 * 分成纯函数而不是写在 hook 里，是为了让这句话能被单测钉死：
 * 白天的环在不同步骤下含义不同（选提名人 / 选被提名人 / 打卡举手 / 什么都不做），
 * 而「点下去到底改了什么」是这一屏最容易出错、也最难在浏览器里逐种情形复现的东西。
 *
 * 三条硬约束在这里都是结构性的：
 * 1. 只碰票型草稿，不碰任何玩家状态——白天的环不改生死，处决才改，而处决在抽屉里。
 * 2. 只碰 nominator / nominee / raised / ghost 四个字段，**永不重算 threshold**。
 *    门槛是说书人手里的数（手改值优先，没手改才按存活数现算），
 *    环上打卡顺手把它按当前存活数刷一遍，等于工具在他背后改了裁定门槛。
 * 3. 返回值是草稿，不是 action。dispatch 由调用方做，本模块没有 dispatch 形参。
 */
import {
  setVoteNominator,
  setVoteNominee,
  toggleGhostVote,
  toggleRaisedVote,
  type VoteRoundDraft,
} from '../../day-workbench/state/voteRound'
import type { NominationTarget } from '../../day-workbench/state/dayRingFocus'
import type { DayStep } from '../../day-workbench/state/dayStep'

/** none = 这一步环上不写票型；此时单击退回既有的座位操作浮层。 */
export type DayRingIntent = 'nominator' | 'nominee' | 'raise' | 'none'

export interface DayRingIntentInput {
  step: DayStep
  nominationTarget: NominationTarget
  /** 白天这一屏唯一的写入闸门，由上层算好后压下来（同 DayWorkbench 的 dayReadOnly）。 */
  readOnly: boolean
}

export function dayRingIntentFor({ step, nominationTarget, readOnly }: DayRingIntentInput): DayRingIntent {
  if (readOnly) return 'none'
  if (step === 'nomination') return nominationTarget
  if (step === 'vote') return 'raise'
  // discussion 与 standing 两步环上没有票型可写：讨论阶段还没提名，
  // 暂列阶段本轮已落账，再点一下只会污染下一轮的草稿。
  return 'none'
}

/** 这一步点座位时给 token 的可访问名后缀，让读屏也知道按下去等于什么。 */
export const DAY_RING_ACTION_HINT: Record<DayRingIntent, string> = {
  nominator: '选为提名人',
  nominee: '选为被提名人',
  raise: '记录举手',
  none: '座位操作',
}

/**
 * 一次环上点击 → 下一份草稿。
 *
 * intent 为 none 时**原样返回同一个对象引用**，调用方据此跳过 dispatch：
 * 返回一份内容相同的新对象会让 session 每点一下就换一次引用，
 * 于是「点环不改 session」这条验收在引用相等这一层直接失守。
 */
export function applyDayRingTap(
  draft: VoteRoundDraft,
  seatId: number,
  intent: DayRingIntent,
): VoteRoundDraft {
  if (intent === 'nominator') return setVoteNominator(draft, seatId)
  if (intent === 'nominee') return setVoteNominee(draft, seatId)
  if (intent === 'raise') return toggleRaisedVote(draft, seatId)
  return draft
}

/**
 * 死亡票 chip 的二次确认。
 *
 * 单独一条路径而不是并进 applyDayRingTap：它不是「点座位」，是点座位旁边那枚
 * 44px 的 chip。两者混在一个函数里，将来给 token 加手势时很容易顺手把死亡票也带上，
 * 而死亡票是一局只有一张、按下去就用掉的东西。
 */
export function applyGhostVoteTap(
  draft: VoteRoundDraft,
  seatId: number,
  readOnly: boolean,
): VoteRoundDraft {
  if (readOnly) return draft
  return toggleGhostVote(draft, seatId)
}
