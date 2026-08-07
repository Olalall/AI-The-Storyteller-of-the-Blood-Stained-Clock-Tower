import type {
  PushRecoverySnapshotCommand,
  PushRecoverySnapshotData,
  RecoveryCommandResult,
  RecoveryRepository,
  RecoverySnapshotRecord,
} from './types'

interface RecoveryHandlerOptions {
  /** 只为测试可控；生产就是墙上时间。 */
  now?: () => string
}

/**
 * 服务端对对局语义只问一个问题：这份记录里有多少条 timeline。
 * 再多问一句（谁死了、第几夜、赢没赢）它就成了第二个规则实现，
 * 而规则实现只许有一个，在客户端。
 */
function entryCountOf(session: unknown): number {
  if (!session || typeof session !== 'object') return 0
  const timeline = (session as { timeline?: unknown }).timeline
  return Array.isArray(timeline) ? timeline.length : 0
}

export function createRecoveryHandlers(repository: RecoveryRepository, options: RecoveryHandlerOptions = {}) {
  const now = options.now ?? (() => new Date().toISOString())

  return {
    async pushSnapshot(command: PushRecoverySnapshotCommand): Promise<RecoveryCommandResult<PushRecoverySnapshotData>> {
      if (!command.sessionId.trim() || !command.session || typeof command.session !== 'object') {
        return { accepted: false, error: 'BAD_REQUEST', warnings: [] }
      }

      const serialized = JSON.stringify(command.session)
      const record: RecoverySnapshotRecord = {
        schemaVersion: 1,
        sessionId: command.sessionId,
        savedAt: command.savedAt,
        receivedAt: now(),
        reason: 'phase-close',
        entryCount: entryCountOf(command.session),
        byteLength: serialized.length,
        session: command.session,
      }

      // 不覆盖规则：记录更少的那份永远顶不掉更完整的那份。
      // 客户端已经拦了一道（只读标签页不推），但那道拦不住时间差——
      // 落后几分钟的标签页推来的半局会把好的那份救生圈换成旧的，
      // 而说书人真去读它的时候，已经没有第二份可比了。相等则以新的为准（同一份的重推）。
      const existing = await repository.get(command.sessionId)
      if (existing && existing.entryCount > record.entryCount) {
        return {
          accepted: true,
          data: { snapshot: existing, superseded: true },
          warnings: ['kept_more_complete_snapshot'],
        }
      }

      return {
        accepted: true,
        data: { snapshot: await repository.put(record), superseded: false },
        warnings: [],
      }
    },

    async getSnapshot(sessionId: string) {
      return repository.get(sessionId)
    },

    async listSnapshots() {
      return repository.list()
    },
  }
}
