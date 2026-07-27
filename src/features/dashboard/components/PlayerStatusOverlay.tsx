import type { Dispatch } from 'react'
import { projectCurrentAssignments, projectCurrentPlayerStates, projectOpenSegmentLabels } from '../../game-session/state/projectors'
import type { GameSessionAction } from '../../game-session/state/sessionReducer'
import type { GameSessionState } from '../../game-session/types'
import { projectSeatActivity } from '../state/projectSeatActivity'
import { PlayerStatusSheet } from './PlayerStatusSheet'

interface PlayerStatusOverlayProps {
  seatId: number | null
  session: GameSessionState
  dispatch: Dispatch<GameSessionAction>
  onOpenChange: (open: boolean) => void
}

export function PlayerStatusOverlay({ seatId, session, dispatch, onOpenChange }: PlayerStatusOverlayProps) {
  const playerStates = projectCurrentPlayerStates(session)
  const seat = seatId === null ? undefined : session.seats[seatId]
  const playerState = seatId === null ? undefined : playerStates[seatId]
  const role = seatId === null ? undefined : projectCurrentAssignments(session).find((assignment) => assignment.seatId === seatId)?.role

  if (!seat || !playerState) return null

  return <PlayerStatusSheet
    open
    onOpenChange={onOpenChange}
    seat={seat}
    role={role}
    playerState={playerState}
    openSegments={projectOpenSegmentLabels(session)}
    activity={projectSeatActivity(session, seat.seatId)}
    onConfirm={({ expectedBefore, after, segmentId }) => dispatch({
      type: 'confirm-player-state-change',
      seatId: seat.seatId,
      expectedBefore,
      after,
      segmentId,
      entryId: `player-state-${seat.seatId}-${Date.now()}`,
      confirmedAt: new Date().toISOString(),
      reason: '说书人手动更新状态',
    })}
  />
}
