import type { NightWorkbenchState, RoleChangeEvent, WakeDraft } from '../types'
import { roleChangeReasonLabel } from './roleChanges'

export type GameRecordBadge = '更正' | '已更正' | '角色变更' | 'AI采用' | '待告知'

export interface GameRecordEntry {
  id: string
  phaseKey: string
  phaseLabel: string
  createdAt: string
  kind: 'night_action' | 'role_change'
  summary: string
  meta: string
  details: string[]
  badges: GameRecordBadge[]
}

function sourceMeta(snapshot: WakeDraft) {
  if (snapshot.outputSource?.kind === 'ai') return 'AI建议已采用'
  if (snapshot.outputSource?.kind === 'preset' && snapshot.outputSource.modifiedFromAI) return '说书人改选AI建议'
  return '说书人'
}

function roleChangeEntry(event: RoleChangeEvent): GameRecordEntry {
  return {
    id: event.id,
    phaseKey: event.nightRunId,
    phaseLabel: event.phaseLabel,
    createdAt: event.changedAt,
    kind: 'role_change',
    summary: `${event.seatId}号角色：${event.fromRole.name} → ${event.toRole.name}`,
    meta: `${roleChangeReasonLabel[event.reason]} · 说书人`,
    details: ['当前夜序快照未自动重排'],
    badges: ['角色变更'],
  }
}

export function projectGameRecordEntries(state: NightWorkbenchState): GameRecordEntry[] {
  const correctedIds = new Set(
    Object.values(state.confirmedRecords).flat().flatMap((record) => record.correctionOf ? [record.correctionOf] : []),
  )
  const wakeEntries = Object.entries(state.confirmedRecords).flatMap(([wakeItemId, records]) => {
    const item = state.queue.find((candidate) => candidate.id === wakeItemId)
    if (!item) return []
    return records.map((record): GameRecordEntry => {
      const badges: GameRecordBadge[] = []
      if (record.correctionOf) badges.push('更正')
      if (correctedIds.has(record.id)) badges.push('已更正')
      if (record.snapshot.outputSource?.kind === 'ai') badges.push('AI采用')
      if (record.snapshot.informationGiven) badges.push('待告知')
      return {
        id: record.id,
        phaseKey: state.nightRunId,
        phaseLabel: state.nightLabel,
        createdAt: record.confirmedAt,
        kind: 'night_action',
        summary: record.snapshot.storytellerResult || `${item.seatId}号 ${item.roleName}：记录已确认`,
        meta: sourceMeta(record.snapshot),
        details: [record.snapshot.playerChoice, record.snapshot.informationGiven && `告知：${record.snapshot.informationGiven}`].filter(Boolean) as string[],
        badges,
      }
    })
  })

  const roleChanges = state.roleChangeEvents
    .filter((event) => event.originNightRunId === state.nightRunId)
    .map(roleChangeEntry)

  return [...wakeEntries, ...roleChanges]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt) || right.id.localeCompare(left.id))
}
