/**
 * 回看态：诚实条 + 只读强制。
 *
 * 这里**没有**第二套魔典。回看是既有画布的一个属性，不是一个新界面——
 * 所以这个目录只导出两样东西：一条挂在画布顶上的横条，和一个把写入面封死的纯函数。
 * 主控在画布外面接它们，画布本身一行都不用知道自己正被回看。
 */
export { ReplayHonestyBar } from './ReplayHonestyBar'
export { replayHonestyNotice, type ReplayHonestyKind, type ReplayHonestyNotice } from './replayHonesty'
export {
  sealGrimoireWrite,
  SEAT_BINDINGS_SURFACE,
  WRITE_LAYER_SURFACE,
  type GrimoireWriteSurface,
  type WriteMemberKind,
} from './sealWriteSurface'
export {
  resolveWriteAccess,
  ARCHIVE_READ_ONLY_REASON,
  LIVE_WRITE_ACCESS,
  type ReplayContext,
  type ReplaySubject,
  type WriteAccess,
} from './writeAccess'
