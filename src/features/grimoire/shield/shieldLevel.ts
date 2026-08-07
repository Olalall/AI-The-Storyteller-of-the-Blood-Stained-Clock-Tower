/**
 * 三级遮蔽的可见性模型。
 *
 * 为什么是模型而不是 CSS：纯记录模式下屏幕一次只暴露一个座位，被瞄一眼损失有限；
 * 魔典模式下一屏就是全部身份加全部标记，被任何一个玩家看到一眼整局直接结束。
 * 所以遮蔽必须决定「渲不渲染」，不能只是盖一层——CSS 覆盖挡不住截屏、屏读器和 devtools。
 *
 * 评审否掉了「L1 显示具名标记也无所谓」的假设：标记 label 本身就是角色信息。
 * 「僧侣保护」暴露场上有僧侣及其今晚保了谁，「红鲱鱼」暴露占卜师及其误导对象，
 * 「是酒鬼」直接暴露一个玩家的真实身份。因此 L1 下 label 与 sourceRoleId 一律不进 DOM，
 * 只留无字圆点与计数。
 */

/** L0 全遮蔽 → L1 席位视图（默认）→ L2 魔典视图。 */
export type ShieldLevel = 'L0' | 'L1' | 'L2'

export const DEFAULT_SHIELD_LEVEL: ShieldLevel = 'L1'

/** L2 无操作自动落回 L1 的时长。揭示态永不无限期停留。 */
export const L2_IDLE_FALLBACK_MS = 90_000

/** 每一项都是「这类数据是否允许进入 DOM」，不是「是否可见」。 */
export interface ShieldVisibility {
  /** 座位号、昵称、生死——玩家看到也无所谓，且是说书人最常需要的量。 */
  seatIdentity: boolean
  /** 中毒/醉酒。属于状态而非身份，L1 可见。 */
  impairments: boolean
  /** 标记的存在与枚数（无字圆点 + 计数）。 */
  markerCount: boolean
  /** 标记的 label 与 sourceRoleId。等同于身份信息。 */
  markerDetail: boolean
  /** 角色名、角色图标 src、角色首字。 */
  roleIdentity: boolean
  /** 说书人私有注记（疯狂/登记）。实体魔典上根本不存在这一层。 */
  annotations: boolean
}

const VISIBILITY: Record<ShieldLevel, ShieldVisibility> = {
  L0: {
    seatIdentity: false,
    impairments: false,
    markerCount: false,
    markerDetail: false,
    roleIdentity: false,
    annotations: false,
  },
  L1: {
    seatIdentity: true,
    impairments: true,
    markerCount: true,
    markerDetail: false,
    roleIdentity: false,
    annotations: false,
  },
  L2: {
    seatIdentity: true,
    impairments: true,
    markerCount: true,
    markerDetail: true,
    roleIdentity: true,
    annotations: true,
  },
}

export function shieldVisibility(level: ShieldLevel): ShieldVisibility {
  return VISIBILITY[level]
}

/**
 * 把设备递给玩家看（间谍查魔典、投屏、发身份）时的强制降级。
 * 间谍要求魔典可被查看而说书人的私有笔记不可见，所以这不是「回到默认」而是「压到 L1 并锁住」。
 */
export function levelForPlayerFacing(): ShieldLevel {
  return 'L1'
}

/**
 * 慌乱中的盲操作路径：双指点画布立刻 L0。
 * 恢复只认单指点大按钮——否则同一个双指手势会把刚盖上的魔典又掀开。
 */
export function levelAfterBlindCover(): ShieldLevel {
  return 'L0'
}

/** 失焦、页面隐藏、无操作超时都落回默认，绝不落回 L2。 */
export function levelAfterIdle(level: ShieldLevel): ShieldLevel {
  return level === 'L2' ? DEFAULT_SHIELD_LEVEL : level
}
