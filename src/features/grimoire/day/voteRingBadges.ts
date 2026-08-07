/**
 * 环上举手打卡的徽标投影。
 *
 * ## 序号为什么是算出来的，不是点击顺序
 *
 * 「计数序号」最直觉的实现是记下说书人点座位的先后。但 raisedSeatIds 在
 * voteRound.toggleRaisedVote 里是**排序去重**存的，点击顺序本来就没被记录，
 * 而为了一个徽标去给 session 加一个 order 数组，等于让一个纯呈现的数字变成持久化真值——
 * 它会跟着归档走，复盘时还得回答「为什么第 3 只手记成了第 5 号」。
 *
 * 所以序号按**唱票顺序**现算：从被提名者的下一位起顺时针数，被提名者自己排最后。
 * 这既是百科里唱票的实际走法（从被提名者左手边起，绕一圈回到他自己），
 * 也让同一份票型在任何时候重算都得到同一组序号——它是投影，不是状态。
 *
 * ## 这里一个算式都不进 payload
 *
 * 徽标里出现的数字（第几只手、总共几只手）与门槛、差额一样，都只在渲染路径上存在。
 * 本模块没有 action 类型、没有 dispatch 形参，这条在文件级别就是结构事实（同裁决 10）。
 */

/** 死亡座位举手后那枚 44px 二次确认 chip 的三态。 */
export type GhostVoteState = 'none' | 'unconfirmed' | 'confirmed'

export interface VoteRingBadge {
  seatId: number
  /** 唱票序号，从 1 起。 */
  order: number
  ghostVote: GhostVoteState
}

export interface VoteRingBadgeInput {
  /** 环上的座位号，按环的顺时针顺序（通常就是 1..N）。 */
  seatIds: readonly number[]
  raisedSeatIds: readonly number[]
  ghostVoteSeatIds: readonly number[]
  /** null = 还没选被提名人，此时从环的第一位起数。 */
  nomineeSeatId: number | null
  deadSeatIds: readonly number[]
}

/**
 * 唱票顺序：被提名者的下一位起，顺时针一圈，被提名者自己收尾。
 * 被提名者不在环上（或还没选）时按环的原顺序数——不猜一个起点。
 */
export function tallySeatOrder(seatIds: readonly number[], nomineeSeatId: number | null): number[] {
  const at = nomineeSeatId === null ? -1 : seatIds.indexOf(nomineeSeatId)
  if (at === -1) return [...seatIds]
  return [...seatIds.slice(at + 1), ...seatIds.slice(0, at + 1)]
}

/**
 * 只为**已举手**的座位产出徽标。没举手的座位一个字都不加——
 * 环上每多一个恒定存在的元素，真正变化的那几个就少一分被看见的机会。
 */
export function voteRingBadges({
  seatIds,
  raisedSeatIds,
  ghostVoteSeatIds,
  nomineeSeatId,
  deadSeatIds,
}: VoteRingBadgeInput): VoteRingBadge[] {
  const raised = new Set(raisedSeatIds)
  const ghosts = new Set(ghostVoteSeatIds)
  const dead = new Set(deadSeatIds)

  return tallySeatOrder(seatIds, nomineeSeatId)
    .filter((seatId) => raised.has(seatId))
    .map((seatId, index) => ({
      seatId,
      order: index + 1,
      // 没举手就不该有死亡票；toggleRaisedVote 已经会连带清掉，这里再挡一层，
      // 免得历史草稿里的残留在环上长出一枚点不掉的 chip。
      ghostVote: dead.has(seatId)
        ? (ghosts.has(seatId) ? 'confirmed' : 'unconfirmed')
        : 'none',
    }))
}
