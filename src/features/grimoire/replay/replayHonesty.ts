/**
 * 回看态的两件事之二：**诚实条**。
 *
 * 它要回答的是一个只有两种答案、而屏幕上长得一模一样的问题：
 * 这个座位上什么都没有，是「当时没有发生」，还是「当时没有记录」？
 *
 * 纯记录模式主持的一局，说书人把生死毒醉记在自己的实体魔典上，工具里一片空白。
 * 事后用魔典视图打开它，会得到一张看起来很完整、实则大半没人录过的魔典——
 * 而这张图会被当成证据用在争议里（「你看第 3 夜他明明没中毒」）。
 * 所以这条不是提示，是**免责声明**：它必须常驻，必须说清两者的区别，且不可关闭。
 *
 * 不对称也在这里：用纯记录视图看魔典局永远安全（信息只会更少，不会看起来更多），
 * 所以那个方向一个字都不说。
 */
import { archiveHostingTag } from '../../../services/archive/archiveHosting'
import type { ReplayContext } from './writeAccess'

export type ReplayHonestyKind = 'cross-mode' | 'read-only'

export interface ReplayHonestyNotice {
  kind: ReplayHonestyKind
  title: string
  /** 分清「没发生」与「没记录」的那一句。整块诚实条的存在理由就是它。 */
  body: string
  /** 「当时录进工具的：12/12 个座位身份 · 0 次状态变更 · 0 枚标记」。 */
  ledger: string
  /** 只读那一句。它与 WriteAccess.reason 说的是同一件事，只是这里常驻可读。 */
  readOnlyNote: string
}

const READ_ONLY_NOTE = '归档只读 · 这里补不了录（补录只能在进行中的对局里做）'

function ledgerLine(context: ReplayContext): string {
  const { seatsWithRole, totalSeats, stateChangeCount, markerCount } = context.archive?.grimoireCompleteness
    ?? { seatsWithRole: 0, totalSeats: 0, stateChangeCount: 0, markerCount: 0 }
  return `当时录进工具的：${seatsWithRole}/${totalSeats} 个座位的身份 · ${stateChangeCount} 次状态变更 · ${markerCount} 枚标记`
}

/**
 * 返回 null = 这一刻不该有诚实条。三种 null：
 * 进行中的对局（没有「当时」）、以及用纯记录视图看任何归档（那个方向不会看多）。
 */
export function replayHonestyNotice(context: ReplayContext): ReplayHonestyNotice | null {
  const { archive } = context
  if (!archive) return null
  if (context.viewMode !== 'grimoire') return null

  const tag = archiveHostingTag(archive)

  if (tag.id === 'record') {
    return {
      kind: 'cross-mode',
      title: '这局是笔录模式主持的 · 眼前这张魔典是事后按记录重建的',
      body: '座位上的空白表示当时没有录入，不表示当时没有这个状态。生死、中毒、标记当年记在说书人自己的实体魔典上，工具里从来就没有。',
      ledger: ledgerLine(context),
      readOnlyNote: READ_ONLY_NOTE,
    }
  }

  if (tag.id === 'mixed') {
    return {
      kind: 'cross-mode',
      // 混合局最危险：后半局的魔典是真的，于是前半局的空白特别像「说书人后来才开始认真记」。
      title: `这局中途才换的模式 · ${tag.label.replace('混合 · ', '')}`,
      body: '换模式之前的那一段是笔录模式主持的，那段的空白表示当时没有录入，不表示当时没有这个状态。',
      ledger: ledgerLine(context),
      readOnlyNote: READ_ONLY_NOTE,
    }
  }

  return {
    kind: 'read-only',
    title: '归档回看',
    body: '这局全程用魔典主持，看到的就是当时录进工具的样子。',
    ledger: ledgerLine(context),
    readOnlyNote: READ_ONLY_NOTE,
  }
}
