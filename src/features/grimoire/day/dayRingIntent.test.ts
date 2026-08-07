import { describe, expect, it } from 'vitest'
import { DAY_RING_ACTION_HINT, applyDayRingTap, applyGhostVoteTap, dayRingIntentFor } from './dayRingIntent'
import { createVoteRoundDraft, toggleRaisedVote, type VoteRoundDraft } from '../../day-workbench/state/voteRound'

const BASE: VoteRoundDraft = createVoteRoundDraft('day-1', 4)

/** 两份草稿之间真正变了的字段名。用来钉死「一次手势只碰它声明的那几个字段」。 */
function changedKeys(before: VoteRoundDraft, after: VoteRoundDraft): string[] {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]) as Set<keyof VoteRoundDraft>
  return [...keys]
    .filter((key) => JSON.stringify(before[key]) !== JSON.stringify(after[key]))
    .sort()
}

describe('点环上一个座位等于什么', () => {
  it('提名步落进抽屉分段当前指着的那个槽', () => {
    expect(dayRingIntentFor({ step: 'nomination', nominationTarget: 'nominator', readOnly: false })).toBe('nominator')
    expect(dayRingIntentFor({ step: 'nomination', nominationTarget: 'nominee', readOnly: false })).toBe('nominee')
  })

  it('计票步是打卡，讨论与暂列两步环上不写票型', () => {
    expect(dayRingIntentFor({ step: 'vote', nominationTarget: 'nominator', readOnly: false })).toBe('raise')
    // 暂列步再点座位只会污染下一轮的草稿——那一轮说书人还没宣布开始。
    expect(dayRingIntentFor({ step: 'standing', nominationTarget: 'nominator', readOnly: false })).toBe('none')
    expect(dayRingIntentFor({ step: 'discussion', nominationTarget: 'nominee', readOnly: false })).toBe('none')
  })

  it('只读闸门盖过一切步骤', () => {
    for (const step of ['discussion', 'nomination', 'vote', 'standing'] as const) {
      expect(dayRingIntentFor({ step, nominationTarget: 'nominee', readOnly: true })).toBe('none')
    }
  })

  it('每种意图都有一句给读屏的话，且互不相同', () => {
    const hints = Object.values(DAY_RING_ACTION_HINT)
    expect(new Set(hints).size).toBe(hints.length)
  })
})

describe('一次环上点击只碰它声明的那几个字段', () => {
  it('打卡举手只动 raisedSeatIds，绝不重算门槛', () => {
    // 门槛是说书人手里的数（手改值优先，没手改才按存活数现算）。
    // 环上顺手把它按当前存活数刷一遍，等于工具在他背后改了裁定门槛。
    const next = applyDayRingTap(BASE, 6, 'raise')

    expect(changedKeys(BASE, next)).toEqual(['raisedSeatIds'])
    expect(next.raisedSeatIds).toEqual([6])
    expect(next.threshold).toBe(BASE.threshold)
  })

  it('取消举手时连带撤掉那张死亡票，且仍然不碰门槛', () => {
    const raised = toggleRaisedVote(BASE, 6)
    const withGhost = { ...raised, ghostVoteSeatIds: [6] }
    const next = applyDayRingTap(withGhost, 6, 'raise')

    expect(changedKeys(withGhost, next).sort()).toEqual(['ghostVoteSeatIds', 'raisedSeatIds'])
    expect(next.raisedSeatIds).toEqual([])
    expect(next.ghostVoteSeatIds).toEqual([])
    expect(next.threshold).toBe(BASE.threshold)
  })

  it('选提名人只动 nominatorSeatId，选被提名人只动 nomineeSeatId', () => {
    expect(changedKeys(BASE, applyDayRingTap(BASE, 2, 'nominator'))).toEqual(['nominatorSeatId'])
    expect(changedKeys(BASE, applyDayRingTap(BASE, 2, 'nominee'))).toEqual(['nomineeSeatId'])
  })

  it('意图为 none 时原样返回同一个对象引用，调用方据此跳过 dispatch', () => {
    // 返回一份内容相同的新对象，会让 session 每点一下就换一次引用，
    // 「点环不改 session」这条验收在引用相等这一层直接失守。
    expect(applyDayRingTap(BASE, 3, 'none')).toBe(BASE)
  })
})

describe('死亡票的二次确认', () => {
  it('只读时纹丝不动', () => {
    const raised = toggleRaisedVote(BASE, 6)
    expect(applyGhostVoteTap(raised, 6, true)).toBe(raised)
  })

  it('举过手才标得上，且只动 ghostVoteSeatIds', () => {
    const raised = toggleRaisedVote(BASE, 6)
    const marked = applyGhostVoteTap(raised, 6, false)

    expect(changedKeys(raised, marked)).toEqual(['ghostVoteSeatIds'])
    expect(marked.ghostVoteSeatIds).toEqual([6])
    // 没举手的人标不上——这一层由 voteRound.toggleGhostVote 守着，这里确认它没被绕过。
    expect(applyGhostVoteTap(BASE, 9, false)).toBe(BASE)
  })

  it('再点一次取消，是可逆的', () => {
    const raised = toggleRaisedVote(BASE, 6)
    const marked = applyGhostVoteTap(raised, 6, false)
    expect(applyGhostVoteTap(marked, 6, false).ghostVoteSeatIds).toEqual([])
  })
})
