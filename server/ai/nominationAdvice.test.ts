import { describe, expect, it } from 'vitest'
import { contradictsNominationRules } from './nominationAdvice'

describe('explicit nomination advice contradictions', () => {
  it.each([
    '死亡玩家依然可以正常发起提名，且不受提名次数或被提名次数的限制。',
    '死亡玩家可以发起提名，但不能在投票环节投票。',
    '每位玩家在白天都可以发起多次提名，没有每人每天仅能提名一次或被提名一次的硬性限制。',
    '每位玩家的提名次数没有限制。',
    '死亡玩家没有投票权。',
    '死亡玩家通常仍有一次死亡票（用于处决投票），使用后即消耗，不能再次投票；这不属于常规投票。',
  ])('catches the observed unqualified false claim: %s', text => {
    expect(contradictsNominationRules(text)).toBe(true)
  })

  it.each([
    '死者不能发起常规提名，但仍可以被提名。',
    '每人每天可以提名一次，也可以被提名一次。',
    '死亡玩家通常还有一次死亡票。',
    '死亡玩家的死亡票已用掉，不能再次投票。',
    '女妖被恶魔杀死并成功发动后，死者每天可以提名两次，每次提名可以投两票。',
    '屠夫能力生效时，该玩家可以发起多次提名，仍须核对已被提名的限制。',
    '驱逐旅行者时，死亡玩家可以支持驱逐，不消耗死亡票。',
    '“死亡玩家可以提名”是错误说法。',
    '死亡玩家可以发起提名吗？',
    '死亡角色因能力保留仍可能需要夜间唤醒。',
    '死亡票就是普通处决提名投票中的一票，存活时的普通投票不会消耗它。',
    '石像鬼技能直接杀死目标，这不是普通处决投票，不消耗死亡票。',
  ])('does not reject a correct limit, explicit exception or question: %s', text => {
    expect(contradictsNominationRules(text)).toBe(false)
  })
})
