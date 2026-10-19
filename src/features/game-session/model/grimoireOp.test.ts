import { describe, expect, it } from 'vitest'
import type { GrimoireOp, GrimoireOpKind } from './grimoireOp'
import { grimoireOpMutableFields } from './grimoireOp'

/**
 * 每种 op 各造一条最小样本。列成常量而不是散在各 it 里，
 * 是为了让下面那条「穷尽性」用例能机械地证明没有漏网的 op。
 */
const samples: Record<GrimoireOpKind, GrimoireOp> = {
  token_added: { op: 'token_added', seatId: 3, token: { id: 'm1', label: '僧侣保护' } },
  token_removed: { op: 'token_removed', seatId: 3, tokenId: 'm1', tokenLabel: '僧侣保护' },
  token_moved: { op: 'token_moved', fromSeatId: 3, toSeatId: 5, tokenId: 'm1' },
  token_inverted: { op: 'token_inverted', seatId: 3, tokenId: 'm1', inverted: true },
  life_set: { op: 'life_set', seatId: 3, life: 'dead' },
  impairment_set: { op: 'impairment_set', seatId: 3, impairment: 'poisoned', value: true },
  alignment_set: { op: 'alignment_set', seatId: 3, alignment: 'evil', inverted: true },
  perceived_role_set: { op: 'perceived_role_set', seatId: 3, role: null },
  role_type_override_set: { op: 'role_type_override_set', seatId: 3, roleType: 'outsider' },
  madness_issued: { op: 'madness_issued', seatId: 3, directiveId: 'd1' },
  madness_lifted: { op: 'madness_lifted', seatId: 3, directiveId: 'd1' },
  ghost_vote_set: { op: 'ghost_vote_set', seatId: 3, available: false },
  private_note_set: { op: 'private_note_set', seatId: 3 },
}

describe('grimoireOpMutableFields 是 op 名字与可改字段的对照表', () => {
  it('covers every op in the union', () => {
    // 漏一种 op 就意味着 grimoireOpMutableFields 里少一个 case，
    // 而 TS 的 switch 在这里返回联合类型、不会报错——只有这条用例能发现。
    const declared = Object.keys(samples) as GrimoireOpKind[]
    expect(declared).toHaveLength(13)
    for (const kind of declared) expect(samples[kind].op).toBe(kind)
  })

  it('lets the four token ops touch markers and nothing else', () => {
    // 标记是贴纸。允许它顺带改 life/poisoned 就等于承认「加中毒标记 = 中毒」，
    // 那一刻工具就开始替说书人裁定了。
    for (const kind of ['token_added', 'token_removed', 'token_moved', 'token_inverted'] as const) {
      expect(grimoireOpMutableFields(samples[kind])).toEqual(['markers'])
    }
  })

  it('lets life_set touch only life', () => {
    expect(grimoireOpMutableFields(samples.life_set)).toEqual(['life'])
  })

  it('narrows impairment_set to the impairment the op actually names', () => {
    // 返回 ['poisoned', 'drunk'] 就允许「记录写着改醉酒、实际改的是中毒」这种对不上账的写入，
    // 复盘时会读出一个从未发生过的事实。
    expect(grimoireOpMutableFields({ op: 'impairment_set', seatId: 3, impairment: 'poisoned', value: true })).toEqual(['poisoned'])
    expect(grimoireOpMutableFields({ op: 'impairment_set', seatId: 3, impairment: 'drunk', value: true })).toEqual(['drunk'])
  })

  it('gives the G4 ops no writable field at all', () => {
    // 阵营、认知角色、角色类型覆盖、疯狂、幽灵票、私有笔记在 G2 都不在 PlayerState 上
    // （裁决 8：新增 PlayerState 字段 = 0）。空集 = 带这类 op 的写入一律判越界。
    // 这比默默放行安全：字段还没做出来就先有人写值，写进去的东西没有任何投影会读，
    // 只会在归档里留下一条永远没人核对的假记录。
    for (const kind of [
      'alignment_set',
      'perceived_role_set',
      'role_type_override_set',
      'madness_issued',
      'madness_lifted',
      'ghost_vote_set',
      'private_note_set',
    ] as const) {
      expect(grimoireOpMutableFields(samples[kind])).toEqual([])
    }
  })

  it('never allows an op to name a field outside PlayerState', () => {
    // 表里冒出 PlayerState 没有的键，说明有人一边加 op 一边偷偷扩了状态模型；
    // 而裁决 8 明确 G1/G2 新增 PlayerState 字段为 0。
    const playerStateKeys = ['life', 'poisoned', 'drunk', 'markers']
    for (const kind of Object.keys(samples) as GrimoireOpKind[]) {
      for (const field of grimoireOpMutableFields(samples[kind])) {
        expect(playerStateKeys).toContain(field)
      }
    }
  })
})
