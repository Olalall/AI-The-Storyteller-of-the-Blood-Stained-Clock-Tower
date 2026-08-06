import { describe, expect, it } from 'vitest'
import { tallySeatOrder, voteRingBadges } from './voteRingBadges'

const SEATS = [1, 2, 3, 4, 5, 6, 7, 8]

describe('唱票顺序', () => {
  it('从被提名者的下一位起顺时针，被提名者自己收尾', () => {
    // 百科：唱票从被提名者左手边那一位开始，绕一圈回到他本人。
    expect(tallySeatOrder(SEATS, 5)).toEqual([6, 7, 8, 1, 2, 3, 4, 5])
  })

  it('被提名者是最后一位时退化成原顺序', () => {
    expect(tallySeatOrder(SEATS, 8)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('还没选被提名者时不猜起点，按环的原顺序数', () => {
    expect(tallySeatOrder(SEATS, null)).toEqual(SEATS)
    expect(tallySeatOrder(SEATS, 99)).toEqual(SEATS)
  })
})

describe('环上举手徽标', () => {
  it('序号按唱票顺序而不是座位号大小', () => {
    // 5 号被提名：唱票顺序是 6,7,8,1,2,3,4,5。
    // 举手的是 1、5、6 号——若有人偷懒按座位号排，1 号会拿到 1 号序号，这条就红。
    const badges = voteRingBadges({
      seatIds: SEATS,
      raisedSeatIds: [1, 5, 6],
      ghostVoteSeatIds: [],
      nomineeSeatId: 5,
      deadSeatIds: [],
    })

    expect(badges.map((badge) => [badge.seatId, badge.order])).toEqual([[6, 1], [1, 2], [5, 3]])
  })

  it('只给举手的人发徽标，没举手的一个字都不加', () => {
    const badges = voteRingBadges({
      seatIds: SEATS,
      raisedSeatIds: [2],
      ghostVoteSeatIds: [],
      nomineeSeatId: 4,
      deadSeatIds: [],
    })

    expect(badges).toHaveLength(1)
    expect(badges[0]).toEqual({ seatId: 2, order: 1, ghostVote: 'none' })
  })

  it('死亡座位举手才长死亡票 chip，活人举手不长', () => {
    const badges = voteRingBadges({
      seatIds: SEATS,
      raisedSeatIds: [2, 7],
      ghostVoteSeatIds: [],
      nomineeSeatId: 1,
      deadSeatIds: [7],
    })

    expect(badges.find((badge) => badge.seatId === 7)?.ghostVote).toBe('unconfirmed')
    expect(badges.find((badge) => badge.seatId === 2)?.ghostVote).toBe('none')
  })

  it('标过死亡票的转成 confirmed', () => {
    const badges = voteRingBadges({
      seatIds: SEATS,
      raisedSeatIds: [7],
      ghostVoteSeatIds: [7],
      nomineeSeatId: 1,
      deadSeatIds: [7],
    })

    expect(badges[0].ghostVote).toBe('confirmed')
  })

  it('残留在 ghostVoteSeatIds 里但没举手的死人，不会在环上长出一枚点不掉的 chip', () => {
    // 这种草稿理论上不该存在（toggleRaisedVote 会连带清掉），
    // 但历史存档里可能有；环上多一枚谁都消不掉的 44px chip 会挡住那个座位。
    const badges = voteRingBadges({
      seatIds: SEATS,
      raisedSeatIds: [],
      ghostVoteSeatIds: [7],
      nomineeSeatId: 1,
      deadSeatIds: [7],
    })

    expect(badges).toEqual([])
  })

  it('不在环上的座位号被忽略，不会挤掉别人的序号', () => {
    const badges = voteRingBadges({
      seatIds: SEATS,
      raisedSeatIds: [3, 99],
      ghostVoteSeatIds: [],
      nomineeSeatId: null,
      deadSeatIds: [],
    })

    expect(badges).toEqual([{ seatId: 3, order: 1, ghostVote: 'none' }])
  })
})
