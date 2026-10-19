/**
 * 归档记录的 1 → 2 迁移。
 *
 * 版本 2 的全部内容就是三个标注字段：`hostingMode`、`hostingModeHistory`、`grimoireCompleteness`。
 * 它们存在的唯一理由是让**回看不说谎**：一局纯记录模式主持的对局，用魔典视图打开时
 * 会是一圈空座位；没有这三个字段，那圈空座位与「说书人开了魔典却懒得录」长得一模一样，
 * 而这两件事对复盘结论、对 AI 复盘草稿、对「当年到底是谁记错了」的争议，是完全相反的答案。
 *
 * 迁移的关键一条：**旧归档一律补 'record'，绝不猜成 'grimoire'**。
 * 理由是史实——hostingMode 这个字段是随魔典模式一起加上去的，在它存在之前主持的每一局，
 * 用的都只能是纯记录模式。把旧归档标成魔典局，等于给一批从来没打开过魔典的对局
 * 发一张「这人开了魔典但只录了三个座位」的成绩单。
 *
 * 唯一的例外不是猜测而是取证：归档内嵌了完整 session，若那份 session 自己带着 hostingMode
 * （G1 之后、归档字段之前那段时间保存的记录就是这样），那是当时**记下来的事实**，
 * 直接采用比强行覆盖成 'record' 更诚实。缺失时才落到 'record'。
 */
import { projectGrimoireCompleteness } from '../../features/grimoire/completeness/grimoireCompleteness'
import type { GameSessionState, HostingMode, HostingModeChange } from '../../features/game-session/types'
import {
  CURRENT_ARCHIVE_SCHEMA_VERSION,
  type ArchiveGrimoireCompleteness,
  type GameArchiveRecord,
} from './types'

/** 旧归档缺 hostingMode 时的回落值。写成常量是为了让测试能指着同一个东西断言。 */
export const LEGACY_HOSTING_MODE: HostingMode = 'record'

function isHostingMode(value: unknown): value is HostingMode {
  return value === 'record' || value === 'grimoire'
}

function hostingModeOf(record: Partial<GameArchiveRecord>): HostingMode {
  if (isHostingMode(record.hostingMode)) return record.hostingMode
  // 内嵌 session 里记下来的模式是事实，不是推断；只有它也没有时才回落。
  if (isHostingMode(record.session?.hostingMode)) return record.session.hostingMode
  return LEGACY_HOSTING_MODE
}

function hostingHistoryOf(record: Partial<GameArchiveRecord>): readonly HostingModeChange[] {
  if (Array.isArray(record.hostingModeHistory)) return record.hostingModeHistory
  const embedded = record.session?.hostingModeHistory
  return Array.isArray(embedded) ? embedded : []
}

function isCompleteness(value: unknown): value is ArchiveGrimoireCompleteness {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<ArchiveGrimoireCompleteness>
  return typeof candidate.seatsWithRole === 'number'
    && typeof candidate.totalSeats === 'number'
    && typeof candidate.stateChangeCount === 'number'
    && typeof candidate.markerCount === 'number'
}

/**
 * 完整度只从内嵌 session 重算，且只在旧归档缺这块时算。
 *
 * 与实时提示条共用 `projectGrimoireCompleteness` 而不是另写一份：两处各算各的，
 * 就会出现「主持时提示条说 12 个座位齐全、归档卡片说 9 个」这种没人能判断谁对的分歧。
 */
export function projectArchiveCompleteness(session: GameSessionState): ArchiveGrimoireCompleteness {
  const live = projectGrimoireCompleteness(session)
  return {
    seatsWithRole: live.seatsWithRole,
    totalSeats: live.totalSeats,
    stateChangeCount: live.stateChangeCount,
    markerCount: live.markerCount,
  }
}

function hasRequiredShape(record: Partial<GameArchiveRecord>): boolean {
  return typeof record.id === 'string'
    && typeof record.sessionId === 'string'
    && typeof record.archivedAt === 'string'
    && typeof record.winner === 'string'
    && typeof record.winnerLabel === 'string'
    && typeof record.scriptName === 'string'
    && typeof record.playerCount === 'number'
    && Boolean(record.summary)
    && Array.isArray(record.timeline)
    && Boolean(record.session)
}

/**
 * 校验 + 补齐三个标注字段，**不动 schemaVersion**。返回 null = 这条不是一份归档。
 *
 * 补齐刻意是「只补缺」：已经带着 hostingMode 的记录原样保留。
 * 每读一次就重算一遍的话，一旦重算逻辑改过，同一份归档在两个版本的工具里会讲两个故事。
 *
 * 之所以把「补字段」与「改版本号」拆成两个函数：版本号是**写入方的自我声明**。
 * 本地存储的写入方就是这里，改它天经地义；而 HTTP 后端至今把落盘记录钉成 1
 * （server/archive/handlers.ts），客户端在读回时擅自改写版本号，会让
 * 「服务端存的」与「客户端看到的」在一次往返后对不上——那条往返保真是有测试钉着的。
 */
export function hydrateArchiveAnnotations(value: unknown): GameArchiveRecord | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Partial<GameArchiveRecord>
  if (record.schemaVersion !== undefined && record.schemaVersion !== 1 && record.schemaVersion !== 2) return null
  if (!hasRequiredShape(record)) return null

  let completeness = record.grimoireCompleteness
  if (!isCompleteness(completeness)) {
    try {
      completeness = projectArchiveCompleteness(record.session as GameSessionState)
    } catch {
      // 投影炸了说明内嵌 session 已经不成形。丢掉整条比留一份编造的零更好：
      // 「0 个座位有身份」在界面上是一句斩钉截铁的假话。
      return null
    }
  }

  return {
    ...(record as GameArchiveRecord),
    schemaVersion: record.schemaVersion ?? 1,
    hostingMode: hostingModeOf(record),
    hostingModeHistory: hostingHistoryOf(record),
    grimoireCompleteness: completeness,
  }
}

/** 本机存储的 1 → 2 迁移：补齐字段并把版本号推到当前档。 */
export function migrateArchiveRecord(value: unknown): GameArchiveRecord | null {
  const hydrated = hydrateArchiveAnnotations(value)
  return hydrated && { ...hydrated, schemaVersion: CURRENT_ARCHIVE_SCHEMA_VERSION }
}

function mapDefined(
  values: unknown,
  transform: (value: unknown) => GameArchiveRecord | null,
): GameArchiveRecord[] {
  if (!Array.isArray(values)) return []
  return values.map(transform).filter((record): record is GameArchiveRecord => record !== null)
}

/** 批量迁移。逐条来，坏的那条不该带走整份列表。 */
export function migrateArchiveRecords(values: unknown): GameArchiveRecord[] {
  return mapDefined(values, migrateArchiveRecord)
}

/** 批量补齐（HTTP 读回路径）。 */
export function hydrateArchiveRecords(values: unknown): GameArchiveRecord[] {
  return mapDefined(values, hydrateArchiveAnnotations)
}
