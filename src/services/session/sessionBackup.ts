import type { GameSessionState } from '../../features/game-session/types'
import { scriptManifest } from '../../domain/scripts'
import { sessionBackupSchema } from './sessionBackupSchema'
import { validArchiveDayFields } from '../archive/archiveDayFields'

export const maxBackupBytes = 10 * 1024 * 1024

export function parseSessionBackup(raw: string): GameSessionState {
  if (new Blob([raw]).size > maxBackupBytes) throw new Error('备份超过 10 MB，请先检查文件。')
  let value: unknown
  try { value = JSON.parse(raw) } catch { throw new Error('文件不是完整的 JSON 备份。') }
  if (!sessionBackupSchema(value)) throw new Error('备份版本或内容不完整，当前仅支持版本 1 的对局备份。')
  const session = value as GameSessionState
  if (!validArchiveDayFields(session)) throw new Error('备份中的票数修正、撤销或特殊处决记录无效。')
  if (!session.id.trim()) throw new Error('备份缺少对局标识。')
  if (!scriptManifest.some((entry) => entry.scriptId === session.scriptId)) throw new Error('当前版本没有该剧本，请使用包含该剧本的版本恢复。')
  const seats = new Set(Object.keys(session.seats))
  const validSeat = (seat: number) => Number.isInteger(seat) && seats.has(String(seat))
  if (Object.keys(session.identityPresentations ?? {}).some((seatId) => !validSeat(Number(seatId)))) throw new Error('备份中的对外身份引用了不存在的座位。')
  if (!Number.isInteger(session.playerCount) || session.playerCount < 0 || session.playerCount > 15 || seats.size !== session.playerCount ||
    Object.entries(session.seats).some(([key, seat]) => !validSeat(seat.seatId) || seat.seatId < 1 || seat.seatId > 15 || key !== String(seat.seatId) || !Object.hasOwn(session.initialPlayerStates, key))) throw new Error('备份中的人数与座位不一致。')
  const phases = new Set(session.phaseSegments.map((phase) => phase.id))
  const entries = new Set(session.timeline.map((entry) => entry.id))
  if (phases.size !== session.phaseSegments.length || entries.size !== session.timeline.length ||
    session.timeline.some((entry) => (entry.segmentId !== null && !phases.has(entry.segmentId)) || (entry.correctionOf && !entries.has(entry.correctionOf)))) throw new Error('备份中的记录引用不完整或存在重复。')
  if (session.activeNightRunId !== null && !Object.hasOwn(session.nightRuns, session.activeNightRunId)) throw new Error('备份缺少当前夜晚。')
  for (const [key, run] of Object.entries(session.nightRuns)) {
    const queueIds = new Set(run.queue.map((item) => item.id))
    if (key !== run.id || (run.phaseSegmentId !== null && !phases.has(run.phaseSegmentId)) || queueIds.size !== run.queue.length ||
      [run.activeCursorId, run.previewEntryId, run.correctionItemId].some((id) => id && !queueIds.has(id)) ||
      run.queue.some((item) => !validSeat(item.seatId)) || Object.keys(run.drafts).some((id) => !queueIds.has(id))) throw new Error('备份中的夜序、光标或草稿引用不完整。')
    if (Object.values(run.drafts).some((draft) => draft.targetRoleChoices?.some((choice) => choice.seatId !== 0 && !validSeat(choice.seatId)))) throw new Error('备份中的爪牙分配引用了不存在的座位。')
  }
  for (const entry of session.timeline) {
    if (entry.kind === 'night_action' && (!Object.hasOwn(session.nightRuns, entry.nightRunId) || !session.nightRuns[entry.nightRunId].queue.some((item) => item.id === entry.wakeItemId))) throw new Error('备份中的夜晚记录缺少对应夜序。')
    if (entry.kind === 'night_action' && entry.record.snapshot.targetRoleChoices?.some((choice) => choice.seatId !== 0 && !validSeat(choice.seatId))) throw new Error('备份中的爪牙分配记录引用了不存在的座位。')
    if ((entry.kind === 'player_state_changed' || entry.kind === 'setup_changed') && !validSeat(entry.seatId)) throw new Error('备份中的玩家记录引用了不存在的座位。')
    if (entry.kind === 'setup_changed' && entry.sourceNightActionId !== undefined && !session.timeline.some((source) => source.id === entry.sourceNightActionId && source.kind === 'night_action' && source.nightRunId === entry.originNightRunId)) throw new Error('备份中的爪牙身份调整缺少对应夜间来源。')
    if (entry.kind === 'setup_confirmed' && entry.setup.draft.assignments.some((assignment) => !validSeat(assignment.seatId))) throw new Error('备份中的配板引用了不存在的座位。')
  }
  const tasks = session.stateFollowups ?? []
  if (new Set(tasks.map((task) => task.id)).size !== tasks.length || tasks.some((task) =>
    !task.id.trim() || !task.note.trim() || !validSeat(task.seatId) || !session.timeline.some((entry) => entry.id === task.sourceEntryId && entry.kind === 'night_action') ||
    (task.resolution?.kind === 'applied' && !session.timeline.some((entry) => entry.id === task.resolution?.entryId && entry.kind === 'player_state_changed' && entry.seatId === task.seatId)))) throw new Error('备份中的状态待办引用不完整。')
  return session
}

export function downloadSessionBackup(session: GameSessionState) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `botc-session-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
