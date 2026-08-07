/**
 * 抽屉在每个节点上的标题、手势契约缺省文案与停靠档位。
 *
 * 从舞台里搬出来，是因为这三张表是同一件事的三个面：「这个节点进来时抽屉长什么样」。
 * 混在舞台的渲染流程里，加第四个节点时很容易只改到其中两张。
 */
import type { DeckNode } from '../../hosting-deck/deckNode'

export const DRAWER_LABEL: Record<DeckNode, string> = {
  dusk: '黄昏交接',
  night: '夜间步骤台',
  dawn: '黎明播报',
  day: '白天步骤台',
}

/** 抽屉顶部常驻的手势契约。暗光下说书人只有余裕记「点下去 = 做当前这一步」。 */
export const GESTURE_CONTRACT: Record<DeckNode, string> = {
  dusk: '点座位 = 座位操作；点完只是草稿，抽屉里确认才落账',
  night: '点座位 = 座位操作；夜间记录仍在抽屉里确认',
  dawn: '点座位 = 座位操作；生死由你更新，工具不反推',
  day: '点座位 = 座位操作；提名与票型在抽屉里记',
}

/**
 * 每个节点进来时抽屉停在哪一档。
 *
 * 夜与昼停在 half：环是主视图，但抽屉里那张工作台的主动作（「检查并关闭」
 * 「结束今天」）也必须够得到，peek 的 96px 装不下它们。
 * half 的高度本身被收窄过——见 detents 里的说明，46dvh 会把环挤成网格。
 * 黄昏与黎明是交接卡，那两步本来就该占满整屏，环让位。
 */
export const DRAWER_DETENT: Record<DeckNode, 'peek' | 'half' | 'full'> = {
  dusk: 'full',
  night: 'half',
  dawn: 'full',
  day: 'half',
}
