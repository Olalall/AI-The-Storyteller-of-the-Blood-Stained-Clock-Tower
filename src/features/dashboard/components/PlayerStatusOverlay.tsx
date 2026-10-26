import { useEffect, useState, type Dispatch } from 'react'
import { projectCurrentAssignments, projectCurrentPlayerStates, projectOpenSegmentLabels } from '../../game-session/state/projectors'
import type { GameSessionAction } from '../../game-session/state/sessionReducer'
import type { GameSessionState } from '../../game-session/types'
import { projectSeatActivity } from '../state/projectSeatActivity'
import { PlayerStatusSheet } from './PlayerStatusSheet'

interface PlayerStatusOverlayProps {
  followupId?: string
  seatId: number | null
  session: GameSessionState
  dispatch: Dispatch<GameSessionAction>
  onOpenChange: (open: boolean) => void
  onCommitted?: () => void
}

export function PlayerStatusOverlay({ seatId, session, dispatch, onOpenChange, followupId, onCommitted }: PlayerStatusOverlayProps) {
  const [submittedId, setSubmittedId] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const playerStates = projectCurrentPlayerStates(session)
  const seat = seatId === null ? undefined : session.seats[seatId]
  const playerState = seatId === null ? undefined : playerStates[seatId]
  const role = seatId === null ? undefined : projectCurrentAssignments(session).find((assignment) => assignment.seatId === seatId)?.role

  useEffect(() => {
    if (!submittedId) return
    setSubmittedId(null)
    if (!session.timeline.some((entry) => entry.id === submittedId && entry.kind === 'player_state_changed')) {
      setNotice('状态未保存，当前状态或编辑权限可能已变化，请核对后重试。')
      return
    }
    onCommitted?.()
    onOpenChange(false)
  }, [submittedId, session.timeline, onCommitted, onOpenChange])

  if (!seat || !playerState) return null

  return <PlayerStatusSheet
    open
    onOpenChange={onOpenChange}
    seat={seat}
    role={role}
    playerState={playerState}
    openSegments={projectOpenSegmentLabels(session)}
    activity={projectSeatActivity(session, seat.seatId)}
    notice={notice}
    onConfirm={({ expectedBefore, after, segmentId }) => {
      const entryId = `player-state-${seat.seatId}-${Date.now()}`
      setNotice('')
      setSubmittedId(entryId)
      dispatch({
      type: 'confirm-player-state-change',
      followupId,
      seatId: seat.seatId,
      expectedBefore,
      after,
      segmentId,
      entryId,
      confirmedAt: new Date().toISOString(),
      reason: '说书人手动更新状态',
      })
    }}
  />
}
