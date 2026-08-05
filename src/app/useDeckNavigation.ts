/**
 * 主持台的相位跳转。
 *
 * 三个动作都**显式开段**而不是让某个投影自动推进：进入夜晚、进入白天、重开一局
 * 都是说书人按下去的，工具不替他决定这一局走到哪了。
 */
import { useState } from 'react'
import { deckNodeForSession, type DeckNode } from '../features/hosting-deck/deckNode'
import { clearIdentityDealReceipts } from '../services/identity-deal'
import type { AppOverlayState } from './useAppOverlays'
import type { GameSessionAction } from '../features/game-session/state/sessionActions'
import type { GameSessionState } from '../features/game-session/types'

export interface DeckNavigation {
  deckNode: DeckNode
  setDeckNode: (node: DeckNode) => void
  enterNight: () => void
  enterDay: () => void
  resetGame: () => void
}

export function useDeckNavigation(
  session: GameSessionState,
  dispatch: (action: GameSessionAction) => void,
  overlays: AppOverlayState,
  onLeaveArchive: () => void,
): DeckNavigation {
  const [deckNode, setDeckNode] = useState<DeckNode>(() => deckNodeForSession(session))

  function enterNight() {
    const activeRun = session.activeNightRunId ? session.nightRuns[session.activeNightRunId] : undefined
    const segment = activeRun?.phaseSegmentId
      ? session.phaseSegments.find((item) => item.id === activeRun.phaseSegmentId)
      : undefined
    // 上一夜已经收尾时才开新的一夜；否则这是回到同一夜继续。
    if (!activeRun || segment?.closedAt) dispatch({ type: 'start-next-night-run' })
    dispatch({ type: 'open-phase-segment', phaseKind: 'night', createdAt: new Date().toISOString() })
    setDeckNode('night')
    onLeaveArchive()
  }

  function enterDay() {
    dispatch({ type: 'open-phase-segment', phaseKind: 'day', createdAt: new Date().toISOString() })
    setDeckNode('day')
    onLeaveArchive()
  }

  function resetGame() {
    clearIdentityDealReceipts(session.id)
    overlays.setSetupScriptId(session.scriptId)
    dispatch({ type: 'reset-session' })
    onLeaveArchive()
    setDeckNode('dusk')
    overlays.closeAll()
    overlays.setSetupOpen(true)
  }

  return { deckNode, setDeckNode, enterNight, enterDay, resetGame }
}
