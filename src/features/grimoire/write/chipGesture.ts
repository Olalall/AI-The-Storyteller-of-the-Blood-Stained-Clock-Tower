/**
 * 环上一枚 chip 被点/被按住时到底是什么意思。
 *
 * 这个文件存在的唯一理由是一处真实的语义冲突：**长按在 chip 上有两种相反的含义**。
 *
 * - 一枚**草稿幽灵**（说书人自己刚点的、或 AI 建议的）长按 = **否决**，
 *   把这条还没落地的改动扔掉。
 * - 一枚**已落盘的标记**长按 = **进入删除**，那是一次真实写入。
 *
 * 两者在环上挨着、长得也像（都是圆点），若按同一条分支处理，
 * 「否决一条 AI 建议」和「删掉一枚已经记了三夜的标记」会是同一个手势。
 * 所以分派条件必须是 chip 是不是草稿，而不是它长什么样、在第几位。
 *
 * 删除的二段摩擦也在这里定死：长按只**装填**一份 marker-remove 草稿，
 * 真正落账仍要按抽屉里那条确认横条。单点击永远删不掉任何东西——
 * 环上 chip 只有 22–28px，单击即删在颠簸的牌桌上等于随机丢标记。
 */

export type ChipTapIntent =
  /** 就地落账：等价于按下抽屉底栏的确认（文档第 149 行）。 */
  | 'commit-draft'
  /** 已落盘标记被单击：什么都不改，只告诉他长按能删。长按不能是无线索的隐藏手势。 */
  | 'announce-hold'
  | 'none'

export type ChipHoldIntent =
  /** 否决这条草稿。 */
  | 'veto-draft'
  /** 装填一份删除草稿，等确认条落账。 */
  | 'arm-delete'
  | null

export interface ChipGestureContract {
  tap: ChipTapIntent
  hold: ChipHoldIntent
  /** 进可访问名的那半句，让读屏用户也知道这枚 chip 上有哪些手势。 */
  hint: string
}

export function chipGestureFor(chip: { draft?: boolean; markerId?: string }): ChipGestureContract {
  // 判据是「是不是草稿」，不是「有没有 markerId」——草稿幽灵将来也可能带上 id。
  if (chip.draft) return { tap: 'commit-draft', hold: 'veto-draft', hint: '点击落账，长按否决' }
  if (chip.markerId) return { tap: 'announce-hold', hold: 'arm-delete', hint: '长按删除这枚标记' }
  // 中毒/醉酒 chip 与 +N 折叠位没有自己的手势：改毒醉走六格，展开折叠走座位卡。
  return { tap: 'none', hold: null, hint: '' }
}
