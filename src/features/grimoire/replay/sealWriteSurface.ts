/**
 * 把只读契约**装到**写入层上。
 *
 * 为什么不是让每个入口读一个 `readOnly` prop 然后自己 `disabled`：
 * 那要求十几个组件各自记得做一次同样的事，而漏掉的那一次没有任何外部表现。
 * 这里改成从上游封口——回看态下拿到的写入层本身就是一具空壳，
 * 组件不改一行也写不出东西；`readOnly` prop 仍然要往下发（那是让按钮看起来是关着的），
 * 但**它不是防线**，防线在这个文件里。
 *
 * 封口按一张清单逐项执行，而不是手写一个新对象：清单用 `satisfies` 钉死在
 * `GrimoireWriteLayer` / `SeatWriteBindings` 的键集上，谁往写入层加一个新成员，
 * 这里编译不过；加进来并标成 'write' 的成员会自动被封。
 * 手写新对象的话，新成员会被 `...spread` 原样带过去——静默可写。
 */
import type { GrimoireWriteLayer } from '../write/useGrimoireWriteLayer'
import type { SeatWriteBindings } from '../write/useSeatWriteBindings'
import type { WriteAccess } from './writeAccess'

/**
 * - `write`   会把写入这件事往前推一步（含只是开个浮层、只是攒一份草稿）。回看态一律封。
 * - `read`    往外给数据。回看态下部分要换成空值：草稿与幽灵在只读局面里不该存在。
 * - `harmless` 只做减法或只播报（清草稿、关浮层、读一句话），封不封都一样，原样放行。
 */
export type WriteMemberKind = 'write' | 'read' | 'harmless'

export const WRITE_LAYER_SURFACE = {
  draft: 'read',
  projected: 'read',
  // 只写本地草稿不 dispatch，但仍算 write：草稿会让确认条升起来，
  // 说书人会以为这一下按下去就能落账。回看态下连这一步都不该发生。
  setDraft: 'write',
  clearDraft: 'harmless',
  segmentId: 'read',
  setSegmentId: 'harmless',
  segments: 'read',
  confirmDraft: 'write',
  commitBackfill: 'write',
  receipt: 'read',
  undo: 'write',
  notify: 'harmless',
  ghostsBySeat: 'read',
  ghostLifeBySeat: 'read',
} satisfies Record<keyof GrimoireWriteLayer, WriteMemberKind>

export const SEAT_BINDINGS_SURFACE = {
  actionBarSeatId: 'read',
  // 打开 SeatActionBar 是写入路径的第一步，也是唯一一个「看起来只是打开一个东西」的一步。
  openActionBar: 'write',
  closeActionBar: 'harmless',
  draftFromCell: 'write',
  addMarker: 'write',
  removeMarker: 'write',
  handleChipGesture: 'write',
} satisfies Record<keyof SeatWriteBindings, WriteMemberKind>

/** 回看态下必须换成空值的 read 成员：只读局面里不存在草稿，也就不存在幽灵。 */
const BLANK_LAYER: Partial<GrimoireWriteLayer> = {
  draft: null,
  projected: null,
  ghostsBySeat: {},
  ghostLifeBySeat: {},
}

const BLANK_BINDINGS: Partial<SeatWriteBindings> = {
  actionBarSeatId: null,
}

function sealBySurface<T extends object>(
  source: T,
  surface: Record<keyof T, WriteMemberKind>,
  blanks: Partial<T>,
  refuse: () => void,
): T {
  const sealed = (Object.keys(surface) as (keyof T)[]).map((key) => {
    const kind = surface[key]
    if (kind === 'write') return [key, refuse] as const
    if (kind === 'read' && key in blanks) return [key, blanks[key]] as const
    return [key, source[key]] as const
  })
  // 键集来自清单而非 source：source 上多出来的成员会被**丢掉**而不是原样带过。
  // 丢掉会立刻暴露（那处功能不见了），带过去则是静默可写。
  return Object.fromEntries(sealed) as T
}

export interface GrimoireWriteSurface {
  layer: GrimoireWriteLayer
  bindings: SeatWriteBindings
}

/**
 * 回看态下把整块写入面封住；进行中的对局原样返回同一个引用（零开销、零行为差异）。
 *
 * 拒绝走 `layer.notify`——那是写入层自己那条「只播报、不写入」的通道，
 * 复用它意味着拒绝也会出现在同一条回执带上，说书人在同一个位置读到为什么没反应。
 */
export function sealGrimoireWrite(surface: GrimoireWriteSurface, access: WriteAccess): GrimoireWriteSurface {
  if (!access.readOnly) return surface
  const refuse = () => surface.layer.notify(access.reason ?? '这里不能写入')
  return {
    layer: sealBySurface(surface.layer, WRITE_LAYER_SURFACE, BLANK_LAYER, refuse),
    bindings: sealBySurface(surface.bindings, SEAT_BINDINGS_SURFACE, BLANK_BINDINGS, refuse),
  }
}
