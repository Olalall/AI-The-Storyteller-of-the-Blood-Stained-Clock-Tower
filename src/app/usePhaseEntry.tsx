import { useEffect, useState, type Dispatch } from 'react'
import { HostNotice } from '../components/ui/HostNotice'
import { createNextNightRun } from '../features/game-session/state/createNextNightRun'
import { getActiveNightRun } from '../features/game-session/state/getActiveNightRun'
import { projectConfirmedSetup } from '../features/game-session/state/projectors'
import type { GameSessionAction } from '../features/game-session/state/sessionReducer'
import type { GameSessionState } from '../features/game-session/types'

export function usePhaseEntry(session: GameSessionState, dispatch: Dispatch<GameSessionAction>, onOpenSetup: () => void, onReady: (view: 'night' | 'day') => void) {
  const [notice, setNotice] = useState('')
  useEffect(() => setNotice(''), [session])
  function enter(phase: 'night' | 'day') {
    if (!projectConfirmedSetup(session)) {
      setNotice(`请先确认本局配板，再进入${phase === 'night' ? '夜晚' : '白天'}。`)
      onOpenSetup()
      return
    }
    if (phase === 'night') {
      const activeRun = getActiveNightRun(session)
      if (session.activeNightRunId && !activeRun) {
        setNotice('当前夜序资料不完整，无法打开。请检查本局备份或恢复有效存档。')
        return
      }
      const segment = session.phaseSegments.find((item) => item.id === activeRun?.phaseSegmentId)
      if (!activeRun || segment?.closedAt) {
        if (!createNextNightRun(session)) {
          setNotice('本局没有可用夜序，请检查已确认配板和剧本夜序。')
          return
        }
        dispatch({ type: 'start-next-night-run' })
      }
    }
    setNotice('')
    dispatch({ type: 'open-phase-segment', phaseKind: phase, createdAt: new Date().toISOString() })
    onReady(phase)
  }
  return { enterNight: () => enter('night'), enterDay: () => enter('day'), clearNotice: () => setNotice(''), notice, feedback: <HostNotice message={notice} autoHideMs={0} /> }
}
