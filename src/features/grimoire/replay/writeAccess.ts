/**
 * 回看态的两件事之一：**只读契约**。
 *
 * 规矩只有一条，但它是硬的——只读**自上而下发**，组件不许自己判断。
 * 「各组件自己看看是不是归档」这条路的失败形态非常隐蔽：绝大多数组件会判对，
 * 漏掉的那一两个照样能写，而它们写出来的记录会以**当年那局**的名义进档案。
 * 归档是战绩，事后往里补一笔和篡改没有区别，所以这道门不能靠自觉。
 *
 * 判据本身故意简单到没有解释空间：**只要在看归档，就只读**。
 * 不按「模式是否相同」分档、不给「只补一笔应该没关系」留缝：
 * 补录只能发生在进行中的对局里，那是唯一还能被现场的人反驳的时刻。
 */
import type { HostingMode, HostingModeChange } from '../../game-session/types'
import type { ArchiveGrimoireCompleteness } from '../../../services/archive/types'

/** 正在被回看的那份归档的自我描述。进行中的对局没有它。 */
export interface ReplaySubject {
  hostingMode: HostingMode
  hostingModeHistory: readonly HostingModeChange[]
  grimoireCompleteness: ArchiveGrimoireCompleteness
}

export interface ReplayContext {
  /** null = 这是进行中的对局，不是回看。 */
  archive: ReplaySubject | null
  /** 此刻用哪种视图在看它。魔典视图看笔录局是唯一需要诚实条的组合。 */
  viewMode: HostingMode
}

/**
 * 每一个写入入口都必须拿到的那一份东西。
 *
 * `reason` 不是可选的装饰：只读时按下去什么都不发生，是本工具里最坏的一种反馈——
 * 说书人会以为自己点上了。所以拒绝必须能说出一句话，由回执带给他。
 */
export interface WriteAccess {
  readOnly: boolean
  /** readOnly 为真时必有；为假时必为 null。 */
  reason: string | null
}

export const ARCHIVE_READ_ONLY_REASON = '归档只读 —— 这局已经归档，补录只能在进行中的对局里做'

/** 进行中的对局。写成常量而不是每次现造，好让「没有门」这件事在代码里也只有一处。 */
export const LIVE_WRITE_ACCESS: WriteAccess = { readOnly: false, reason: null }

/** 决定只读与否的**唯一**一处。别处若再出现一个同样的判断，就是这条契约被绕开了。 */
export function resolveWriteAccess(context: ReplayContext): WriteAccess {
  if (!context.archive) return LIVE_WRITE_ACCESS
  return { readOnly: true, reason: ARCHIVE_READ_ONLY_REASON }
}
