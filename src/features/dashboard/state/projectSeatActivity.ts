import type { GameSessionState, TimelineEntry } from '../../game-session/types'
import { projectEffectiveTimelineEntries } from '../../game-session/state/projectTimelineHistory'

export interface SeatActivity {
  id: string
  createdAt: string
  phaseLabel: string
  summary: string
}

function phaseLabel(session: GameSessionState, entry: TimelineEntry) {
  return entry.segmentId ? session.phaseSegments.find((segment) => segment.id === entry.segmentId)?.label ?? '本局' : '本局'
}

function nightItemSeatId(session: GameSessionState, entry: Extract<TimelineEntry, { kind: 'night_action' }>) {
  return session.nightRuns[entry.nightRunId]?.queue.find((item) => item.id === entry.wakeItemId)?.seatId
}

export function projectSeatActivity(session: GameSessionState, seatId: number): SeatActivity[] {
  const activity: SeatActivity[] = []
  for (const entry of projectEffectiveTimelineEntries(session.timeline)) {
    const phase = phaseLabel(session, entry)
    switch (entry.kind) {
      case 'setup_confirmed': {
        const assignment = entry.setup.draft.assignments.find((item) => item.seatId === seatId)
        if (assignment) activity.push({ id: entry.id, createdAt: entry.createdAt, phaseLabel: phase, summary: `身份确认：${assignment.role.name}` })
        break
      }
      case 'setup_changed':
        if (entry.seatId === seatId) activity.push({ id: entry.id, createdAt: entry.createdAt, phaseLabel: phase, summary: `身份调整：${entry.fromRole.name} → ${entry.toRole.name}` })
        break
      case 'player_state_changed':
        if (entry.seatId === seatId) activity.push({ id: entry.id, createdAt: entry.createdAt, phaseLabel: phase, summary: `状态更新：${entry.after.life === 'dead' ? '死亡' : '存活'}${entry.after.poisoned ? ' · 中毒' : ''}${entry.after.drunk ? ' · 醉酒' : ''}` })
        break
      case 'night_action': {
        const actorSeatId = nightItemSeatId(session, entry)
        if (actorSeatId === seatId) activity.push({ id: entry.id, createdAt: entry.createdAt, phaseLabel: phase, summary: `夜间行动：${entry.summary}` })
        else if (entry.record.snapshot.targets.includes(seatId)) activity.push({ id: entry.id, createdAt: entry.createdAt, phaseLabel: phase, summary: `被选为目标：${entry.summary}` })
        break
      }
      case 'vote_round': {
        const details = [
          entry.nominatorSeatId === seatId ? `提名${entry.nomineeSeatId}号` : '',
          entry.nomineeSeatId === seatId ? `被${entry.nominatorSeatId}号提名` : '',
          entry.raisedSeatIds.includes(seatId) ? '本轮举手' : '',
          entry.ghostVoteSeatIds.includes(seatId) ? '使用死亡票' : '',
        ].filter(Boolean)
        if (details.length) activity.push({ id: entry.id, createdAt: entry.createdAt, phaseLabel: phase, summary: details.join(' · ') })
        break
      }
      case 'execution':
        if (entry.executedSeatId === seatId) activity.push({ id: entry.id, createdAt: entry.createdAt, phaseLabel: phase, summary: '确认被处决' })
        break
      case 'day_action': {
        const details = [
          entry.actorSeatId === seatId ? entry.category === 'skill' ? '发动白天技能' : '关联公开事件' : '',
          entry.targetSeatIds.includes(seatId) ? entry.category === 'skill' ? '白天技能目标' : '公开事件涉及' : '',
        ].filter(Boolean)
        if (details.length) activity.push({ id: entry.id, createdAt: entry.createdAt, phaseLabel: phase, summary: details.join(' · ') })
        break
      }
      case 'no_execution':
        break
    }
  }
  return activity.sort((left, right) => right.createdAt.localeCompare(left.createdAt) || right.id.localeCompare(left.id))
}
