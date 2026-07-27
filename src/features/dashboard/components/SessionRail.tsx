import { FlaskConical, HeartPulse, Skull, Tag, Wine } from 'lucide-react'
import { scriptDisplayName } from '../../../domain/scripts'
import { storytellerSeatLabel, storytellerStateLabel } from '../../game-session/seatPresentation'
import { projectCurrentPlayerStates, projectOpenSegmentLabels } from '../../game-session/state/projectors'
import { projectEffectiveTimelineEntries } from '../../game-session/state/projectTimelineHistory'
import type { GameSessionState } from '../../game-session/types'
import './session-rail.css'

interface SessionRailProps {
  session: GameSessionState
  onOpenPlayerStatus: (seatId: number) => void
}

function latestSummary(session: GameSessionState) {
  const latest = [...projectEffectiveTimelineEntries(session.timeline)]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt) || right.id.localeCompare(left.id))[0]
  if (!latest) return '尚无确认记录'
  if (latest.kind === 'night_action' || latest.kind === 'day_action') return latest.summary
  if (latest.kind === 'vote_round') return `${latest.nominatorSeatId}号提名${latest.nomineeSeatId}号 · ${latest.raisedSeatIds.length}票`
  if (latest.kind === 'execution') return `确认处决${latest.executedSeatId}号`
  if (latest.kind === 'no_execution') return '确认无处决'
  if (latest.kind === 'player_state_changed') return `${latest.seatId}号状态已更新`
  if (latest.kind === 'setup_confirmed') return '配板已确认'
  if (latest.kind === 'setup_changed') return `${latest.seatId}号角色已调整`
  return '本局记录已更新'
}

export function SessionRail({ session, onOpenPlayerStatus }: SessionRailProps) {
  const states = projectCurrentPlayerStates(session)
  const segments = projectOpenSegmentLabels(session)

  return (
    <div className="session-rail" aria-label="本局速览">
      <section className="session-rail__session">
        <span>本局速览</span>
        <strong>{scriptDisplayName(session.scriptId)}</strong>
      </section>
      <section className="session-rail__section" aria-labelledby="rail-phase-title">
        <span id="rail-phase-title">当前记录</span>
        {segments.length ? <ul className="session-rail__segments">{segments.map((segment) => <li key={segment.id}>{segment.label}</li>)}</ul> : <p>尚未开始记录</p>}
      </section>
      <section className="session-rail__section" aria-labelledby="rail-player-title">
        <span id="rail-player-title">玩家状态</span>
        <div className="session-rail__seats">
          {Array.from({ length: session.playerCount }, (_value, index) => {
            const seatId = index + 1
            const state = states[seatId]
            const LifeIcon = state.life === 'alive' ? HeartPulse : Skull
            return <button key={seatId} type="button" className={state.life === 'alive' ? 'is-alive' : 'is-dead'} onClick={() => onOpenPlayerStatus(seatId)} aria-label={`查看${storytellerSeatLabel(session.seats[seatId])}：${storytellerStateLabel(state)}`}>
              <strong>{seatId}</strong><LifeIcon aria-hidden="true" />
              <i aria-hidden="true">{state.poisoned ? <FlaskConical /> : null}{state.drunk ? <Wine /> : null}{state.markers.length ? <Tag /> : null}</i>
            </button>
          })}
        </div>
      </section>
      <section className="session-rail__section session-rail__latest" aria-labelledby="rail-latest-title">
        <span id="rail-latest-title">最近确认</span>
        <p>{latestSummary(session)}</p>
      </section>
    </div>
  )
}
