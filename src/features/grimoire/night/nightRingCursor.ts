/**
 * 夜序光标的空间化：把「队列里的第几项」翻译成环上每个座位的一枚角标。
 *
 * 为什么值得单独成一个纯函数：夜间最贵的一次认知动作是「下一个叫谁、他坐哪」。
 * 转盘只回答前半句，环能同时回答两句——但只有当「谁是当前项、谁是后续两项」
 * 这条规则与工作台推进光标用的规则**逐字相同**时才成立。两份规则一旦漂移，
 * 环上打着 ① 的座位和按下「进入下一位」真正跳到的座位会是两个人，
 * 而这种错在暗光下没有任何人会当场发现。
 *
 * 所以跳过规则直接对齐 `nightWorkbenchDrafts.advanceFrom`：只跳过 confirmed
 * 与 not_applicable，**不因生死、毒醉跳过**（很多能力仍要在死人身上结算，
 * 中毒者照样要被叫醒并给假信息）。这一层拿不到生死也拿不到毒醉，是刻意的：
 * 拿不到就没人能顺手加一个「跳过死人」的分支。
 */
import { shieldVisibility, type ShieldLevel } from '../shield/shieldLevel'
import type { WakeItem, WakeProgress } from '../../night-workbench/types'

/** 环上四种角标，与设计文档第 1 条一一对应。 */
export type NightBadgeKind =
  /** 当前项：全屏唯一一枚暖金焦点环。 */
  | 'focus'
  /** 后续两项：冷灰 ①②。 */
  | 'upcoming'
  /** 已确认：✓。 */
  | 'confirmed'
  /** 已暂缓：「缓」。 */
  | 'deferred'

export interface NightSeatBadge {
  seatId: number
  kind: NightBadgeKind
  /**
   * upcoming 才有值（1 起），渲染成 ①②；其余一律 null。
   * 类型不写死成 1|2：上限是 UPCOMING_BADGE_COUNT 一个常量，把它抄进类型就成了两处得同时改的约定。
   */
  ordinal: number | null
  /** 进可访问名的那句话。角标本身是 aria-hidden 的装饰，读屏只靠这句。 */
  label: string
}

/** 后续项打几枚角标。再多环上就成了一串序号，而人一次只记得住「下一个 + 再下一个」。 */
export const UPCOMING_BADGE_COUNT = 2

const CIRCLED = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨']

/**
 * 1→① … 9→⑨，再多退回阿拉伯数字。
 * 带圈数字比「第1个」窄得多，而角标只有 18px——序号一旦换行，环上就多了一处对不齐。
 */
export function ordinalGlyph(value: number): string {
  return CIRCLED[value - 1] ?? String(value)
}

/**
 * 「这一项已经过去了」。与 advanceFrom 的 `!['confirmed','not_applicable'].includes(progress)`
 * 是同一个集合——deferred 不在里面，因为暂缓项会被光标重新走到，它是待办不是过去。
 */
const PASSED: ReadonlySet<WakeProgress> = new Set<WakeProgress>(['confirmed', 'not_applicable'])

/**
 * 同一个座位被两项命中时谁赢。数字小的赢。
 *
 * focus 最贵（全屏唯一一枚，指错人代价最大）；
 * upcoming 次之（待办）；deferred 再次（也是待办，但没有具体次序）；
 * confirmed 最后（已经过去的事，环上只是备查）。
 */
const RANK: Record<NightBadgeKind, number> = {
  focus: 0,
  upcoming: 1,
  deferred: 2,
  confirmed: 3,
}

/** 只取排布角标真正需要的三个字段，好让归档里的 NightRunState.queue 直接喂进来。 */
export type NightCursorQueueItem = Pick<WakeItem, 'id' | 'seatId' | 'progress'>

export interface NightRingCursorInput {
  queue: readonly NightCursorQueueItem[]
  /**
   * 抽屉此刻正在显示的那一项（工作台的 previewEntryId，不是 activeCursorId）。
   *
   * 取 preview 而不是 active：环上那枚暖金焦点环与抽屉里那张卡必须指同一个人，
   * 否则说书人预览别的项时，环说 5 号、抽屉说 7 号，两块屏各说各的。
   * 「正在处理的是哪一项」由抽屉自己的预览徽标承担，那是它本来就有的表达。
   */
  focusItemId: string
}

function badgeLabel(kind: NightBadgeKind, ordinal: number | null): string {
  if (kind === 'focus') return '夜序当前项'
  if (kind === 'upcoming') return `夜序后续第${ordinal}项`
  if (kind === 'confirmed') return '夜序已确认'
  return '夜序已暂缓'
}

/**
 * 环上每个座位一枚角标。没有角标的座位不在 Map 里——返回一枚 kind 为 'none' 的空角标
 * 会让调用方多一层判空，而「这个座位今晚没被夜序碰过」本来就该是「没有东西」。
 *
 * focusItemId 在队列里找不到时不猜：不打焦点环、也不打 ①②，只保留 ✓ 与「缓」。
 * 这比退到队首更安全——一枚指错人的暖金焦点环会被当成权威，而缺一枚只是少一条提示。
 */
export function nightRingBadges(input: NightRingCursorInput): ReadonlyMap<number, NightSeatBadge> {
  const badges = new Map<number, NightSeatBadge>()

  /** 返回「这一枚真的画上去了吗」：序号只在画上去时才消耗，见下面的循环。 */
  const put = (seatId: number, kind: NightBadgeKind, ordinal: number | null): boolean => {
    const existing = badges.get(seatId)
    if (existing && RANK[existing.kind] <= RANK[kind]) return false
    badges.set(seatId, { seatId, kind, ordinal, label: badgeLabel(kind, ordinal) })
    return true
  }

  for (const item of input.queue) {
    if (item.progress === 'confirmed') put(item.seatId, 'confirmed', null)
    if (item.progress === 'deferred') put(item.seatId, 'deferred', null)
  }

  const focusIndex = input.queue.findIndex((item) => item.id === input.focusItemId)
  if (focusIndex === -1) return badges

  put(input.queue[focusIndex].seatId, 'focus', null)

  // 序号只在角标真的画上去时才前进。一个座位同时是当前项和后续项时（同一夜里两次醒来，
  // 例如系统步骤卡与本人技能落在同一座位），焦点压住了后续那一枚——此时若照样把序号用掉，
  // 环上就会只有一个 ②、找不到 ①，而说书人会以为自己漏看了一枚。
  let ordinal = 1
  for (const item of input.queue.slice(focusIndex + 1)) {
    if (PASSED.has(item.progress)) continue
    if (!put(item.seatId, 'upcoming', ordinal)) continue
    if (ordinal >= UPCOMING_BADGE_COUNT) break
    ordinal += 1
  }

  return badges
}

/**
 * 哪几种角标允许进入 DOM。**遮蔽决定渲不渲染，不是显不显示**，所以这是过滤器不是样式。
 *
 * 分档理由沿用裁决 6 给的那把尺：「粗粒度、不足以定位角色，且是说书人最高频需要的量」保留，
 * 细粒度的推后到 L2。
 *
 * - focus / upcoming 是一个**三座位的滑动窗口**：被瞄一眼只能得到「这几个人现在前后行动」，
 *   下一分钟窗口就移走了，而说书人的手指本来就指在那里。它们又恰好是夜里最高频的两个量
 *   （「现在叫谁」「下一个叫谁」）。抽掉它们等于默认态下的夜间魔典不可用——
 *   而 L1 是默认态，不是应急态。
 * - confirmed / deferred 是**累积**的：一夜下来环上会长出一张「谁有夜间能力」的完整地图，
 *   那是整局最贵的一次性泄密面，与「标记 label 累积起来等于角色表」是同一类问题。
 *   说书人需要的「还剩几项」由核上的「本夜待处理」和抽屉里的夜序进度承担，信息没有丢，只是换了地方。
 */
export interface NightBadgeVisibility {
  focus: boolean
  upcoming: boolean
  settled: boolean
}

export function nightBadgeVisibility(level: ShieldLevel): NightBadgeVisibility {
  const visibility = shieldVisibility(level)
  return {
    // L0 下座位本身就不进 DOM，这里跟着一起归零，免得叠加层被挂到别处时漏掉这一档。
    focus: visibility.seatIdentity,
    upcoming: visibility.seatIdentity,
    // 与标记 label 同一档：能拼出角色地图的东西只在魔典视图下出现。
    settled: visibility.markerDetail,
  }
}

/** 这一枚角标此刻允不允许渲染。 */
export function isNightBadgeVisible(badge: NightSeatBadge, level: ShieldLevel): boolean {
  const allowed = nightBadgeVisibility(level)
  if (badge.kind === 'focus') return allowed.focus
  if (badge.kind === 'upcoming') return allowed.upcoming
  return allowed.settled
}
