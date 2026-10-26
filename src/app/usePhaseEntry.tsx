import { useEffect, useState, type Dispatch } from 'react'
import { HostNotice } from '../components/ui/HostNotice'
import { createNextNightRun } from '../features/game-session/state/createNextNightRun'
import { getActiveNightRun } from '../features/game-session/state/getActiveNightRun'
import { projectConfirmedSetup } from '../features/game-session/state/projectors'
import { poppyRecognitionIncomplete } from '../features/game-session/state/poppyRecognition'
import type { GameSessionAction } from '../features/game-session/state/sessionReducer'
import type { GameSessionState } from '../features/game-session/types'

export function usePhaseEntry(session: GameSessionState, dispatch: Dispatch<GameSessionAction>, onOpenSetup: () => void, onReady: (view: 'night' | 'day' | 'dashboard') => void, view: 'night' | 'day' | 'dashboard' | 'timer', canEdit: boolean) {
  const [notice, setNotice] = useState('')
  useEffect(() => setNotice(''), [session])
  useEffect(() => {
    if (view !== 'day' || session.phaseSegments.some((segment) => segment.kind === 'day' && !segment.closedAt)) return
    const closed = session.phaseSegments.filter((segment) => segment.kind === 'day').at(-1)
    if (!closed?.closedAt) return
    setNotice(`${closed.label}已结束，记录已保留；未开始夜晚。`)
    onReady('dashboard')
  }, [view, session.phaseSegments, onReady])
  function enter(phase: 'night' | 'day') {
    if (!canEdit) {
      setNotice(`本局暂时不能编辑，请稍候；如有编辑保护提示，请先处理，再进入${phase === 'night' ? '夜晚' : '白天'}。`)
      return
    }
    if (!projectConfirmedSetup(session)) {
      setNotice(`请先确认本局配板，再进入${phase === 'night' ? '夜晚' : '白天'}。`)
      onOpenSetup()
      return
    }
    if (phase === 'day' && poppyRecognitionIncomplete(session)) { setNotice('罂粟已死亡，请先在夜晚补入并核对相认步骤。'); onReady('night'); return }
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
