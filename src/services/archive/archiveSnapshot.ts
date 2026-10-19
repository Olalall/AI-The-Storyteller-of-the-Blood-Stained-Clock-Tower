import type { GameSessionState } from '../../features/game-session/types'
import type { GameArchiveRecord, GameWinner } from './types'
import { scriptManifest } from '../../domain/scripts/scriptManifest.generated'

export function archiveScriptName(archive: GameArchiveRecord) {
  return scriptManifest.find((script) => script.scriptId === archive.session?.scriptId)?.displayName ?? archive.scriptName
}

export function archiveMatchesSnapshot(archive: GameArchiveRecord, session: GameSessionState, winner = archive.winner) {
  return archive.winner === winner && JSON.stringify(archive.session) === JSON.stringify(session)
}

export function archiveSnapshotKey(session: GameSessionState, winner: GameWinner) {
  return JSON.stringify({ session, winner })
}
