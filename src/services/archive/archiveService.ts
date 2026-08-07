import { projectCurrentPlayerStates } from '../../features/game-session/state/projectors'
import { projectEffectiveTimelineEntries } from '../../features/game-session/state/projectTimelineHistory'
import type { GameSessionState, TimelineEntry } from '../../features/game-session/types'
import { assertNever } from '../../shared/assertNever'
import { localArchiveAdapter } from './localArchiveAdapter'
import { LEGACY_HOSTING_MODE, projectArchiveCompleteness } from './archiveMigration'
import {
  CURRENT_ARCHIVE_SCHEMA_VERSION,
  winnerLabels,
  type ArchiveGameCommand,
  type ArchiveGameResult,
  type ArchiveAdapter,
  type AsyncArchiveAdapter,
  type GameArchiveRecord,
  type GameArchiveSessionProjection,
  type GameWinner,
  type ResetAfterArchiveCommand,
  type ResetAfterArchiveResult,
} from './types'

let activeArchiveAdapter: ArchiveAdapter = localArchiveAdapter
let activeAsyncArchiveAdapter: AsyncArchiveAdapter | null = null

export function setArchiveAdapter(adapter: ArchiveAdapter) {
  activeArchiveAdapter = adapter
}

export function resetArchiveAdapter() {
  activeArchiveAdapter = localArchiveAdapter
}

export function setAsyncArchiveAdapter(adapter: AsyncArchiveAdapter) {
  activeAsyncArchiveAdapter = adapter
}

export function resetAsyncArchiveAdapter() {
  activeAsyncArchiveAdapter = null
}

interface CreateGameArchiveRecordOptions {
  session: GameSessionState
  winner: GameWinner
  archiveId?: string
  archivedAt?: string
}

function countByKind(entries: TimelineEntry[]) {
  return entries.reduce<Record<string, number>>((counts, entry) => {
    counts[entry.kind] = (counts[entry.kind] ?? 0) + 1
    return counts
  }, {})
}

function entrySummary(entry: TimelineEntry): string {
  switch (entry.kind) {
    case 'night_action': return entry.summary
    case 'day_action': return entry.summary
    case 'vote_round': return `${entry.nominatorSeatId}号提名${entry.nomineeSeatId}号 · ${entry.raisedSeatIds.length}票`
    case 'execution': return `确认处决${entry.executedSeatId}号`
    case 'no_execution': return '确认无处决'
    case 'player_state_changed': return `${entry.seatId}号状态已更新`
    case 'setup_confirmed': return '配板已确认'
    case 'setup_changed': return `${entry.seatId}号角色已调整`
    default:
      // 归档必须容忍更新版本写入的条目：只做编译期穷尽，运行时仍给空摘要而不是崩掉整份归档。
      assertNever(entry)
      return ''
  }
}

export function projectGameArchiveSession(session: GameSessionState): GameArchiveSessionProjection {
  const playerStates = Object.values(projectCurrentPlayerStates(session))
  const alive = playerStates.filter((state) => state.life === 'alive').length
  const dead = playerStates.filter((state) => state.life === 'dead').length
  const entries = projectEffectiveTimelineEntries(session.timeline)
  const kindCounts = countByKind(entries)
  const nightCount = kindCounts.night_action ?? 0
  const dayCount = kindCounts.day_action ?? 0
  const voteCount = kindCounts.vote_round ?? 0
  const executionCount = kindCounts.execution ?? 0
  const correctionCount = entries.filter((entry) => Boolean(entry.correctionOf)).length

  return {
    alive,
    dead,
    entries,
    nightCount,
    dayCount,
    voteCount,
    executionCount,
    correctionCount,
    reviewSignals: [
      nightCount ? '夜间行动已记录' : '夜间行动较少',
      voteCount ? '投票链可回放' : '暂无投票链',
      correctionCount ? `${correctionCount}条更正` : '无更正',
    ],
  }
}

export function createGameArchiveRecord({
  session,
  winner,
  archiveId,
  archivedAt = new Date().toISOString(),
}: CreateGameArchiveRecordOptions): GameArchiveRecord {
  const projection = projectGameArchiveSession(session)

  return {
    schemaVersion: CURRENT_ARCHIVE_SCHEMA_VERSION,
    id: archiveId ?? `archive-${session.id}-${Date.now()}`,
    sessionId: session.id,
    archivedAt,
    winner,
    winnerLabel: winnerLabels[winner],
    scriptName: 'Catfishing / 瓦釜雷鸣',
    playerCount: session.playerCount,
    summary: {
      alive: projection.alive,
      dead: projection.dead,
      phases: session.phaseSegments.length,
      records: projection.entries.length,
      nightActions: projection.nightCount,
      dayActions: projection.dayCount,
      votes: projection.voteCount,
      executions: projection.executionCount,
      corrections: projection.correctionCount,
    },
    timeline: projection.entries.map((entry) => {
      const segment = entry.segmentId ? session.phaseSegments.find((item) => item.id === entry.segmentId) : undefined
      return {
        id: entry.id,
        kind: entry.kind,
        phaseLabel: segment?.label ?? (entry.kind.startsWith('setup_') ? '配板' : '本局'),
        summary: entrySummary(entry),
        createdAt: entry.createdAt,
      }
    }),
    session,
    // 归档时把模式与完整度**固化**下来。内嵌 session 里其实也有前两个，但复盘读的是这里：
    // 一份归档的自我描述不该依赖读取方去内嵌 session 里翻，翻的路径每多一条，
    // 就多一处可能写成 `?? 'grimoire'` 的回落。
    hostingMode: session.hostingMode ?? LEGACY_HOSTING_MODE,
    hostingModeHistory: session.hostingModeHistory ?? [],
    grimoireCompleteness: projectArchiveCompleteness(session),
  }
}

export function archiveGame(command: ArchiveGameCommand): ArchiveGameResult {
  const record = createGameArchiveRecord({
    session: command.session,
    winner: command.winner,
    archiveId: command.archiveId ?? `archive-${command.session.id}-${command.commandId}`,
  })
  return {
    archive: record,
    archives: activeArchiveAdapter.save(record),
  }
}

export async function archiveGameAsync(command: ArchiveGameCommand): Promise<ArchiveGameResult> {
  if (!activeAsyncArchiveAdapter) return archiveGame(command)

  const record = createGameArchiveRecord({
    session: command.session,
    winner: command.winner,
    archiveId: command.archiveId ?? `archive-${command.session.id}-${command.commandId}`,
  })
  const archives = await activeAsyncArchiveAdapter.save(record)
  return {
    archive: archives.find((archive) => archive.id === record.id) ?? record,
    archives,
  }
}

export function listArchives(): GameArchiveRecord[] {
  return activeArchiveAdapter.load()
}

export async function listArchivesAsync(): Promise<GameArchiveRecord[]> {
  return activeAsyncArchiveAdapter ? activeAsyncArchiveAdapter.load() : listArchives()
}

export function getArchive(archiveId: string): GameArchiveRecord | null {
  return activeArchiveAdapter.get(archiveId)
}

export async function getArchiveAsync(archiveId: string): Promise<GameArchiveRecord | null> {
  return activeAsyncArchiveAdapter ? activeAsyncArchiveAdapter.get(archiveId) : getArchive(archiveId)
}

export function resetAfterArchive(command: ResetAfterArchiveCommand): ResetAfterArchiveResult {
  if (!command.confirmReset) return { ok: false, reason: 'reset_not_confirmed' }
  const archive = getArchive(command.archiveId)
  if (!archive) return { ok: false, reason: 'archive_not_found' }
  if (archive.sessionId !== command.sessionId) return { ok: false, reason: 'session_mismatch' }
  return { ok: true, archiveId: archive.id }
}

export async function resetAfterArchiveAsync(command: ResetAfterArchiveCommand): Promise<ResetAfterArchiveResult> {
  if (!command.confirmReset) return { ok: false, reason: 'reset_not_confirmed' }
  const archive = await getArchiveAsync(command.archiveId)
  if (!archive) return { ok: false, reason: 'archive_not_found' }
  if (archive.sessionId !== command.sessionId) return { ok: false, reason: 'session_mismatch' }
  return { ok: true, archiveId: archive.id }
}
