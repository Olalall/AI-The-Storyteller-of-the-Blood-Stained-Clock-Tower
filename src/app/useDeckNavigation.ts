/**
 * 主持台的相位跳转。
 *
 * 三个动作都**显式开段**而不是让某个投影自动推进：进入夜晚、进入白天、重开一局
 * 都是说书人按下去的，工具不替他决定这一局走到哪了。
 */
import { useEffect, useState } from 'react'
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

  /**
   * 白天段被关掉之后，视图要跟着走到黄昏。
   *
   * 夜晚有 onCloseNight 显式把节点推到黎明，白天一直没有对应的一条：
   * 说书人按下「确认结束」，段落在数据层确实关了、轨道也变成「黄昏（建议下一步）」，
   * 但持有的节点仍是 day，于是渲染出一张**全新的空白天**——提名人未选、举手未记录，
   * 看起来像刚才那一天没保存，而且再没有任何入口能走到黄昏。
   *
   * 这不是「自动推进相位」：相位是说书人按那颗键推进的，这里只是让视图跟上已经
   * 发生的事实。下一道门仍然是黄昏卡上的「所有玩家闭眼 · 开始第N夜」。
   */
  const dayStillOpen = session.phaseSegments.some((segment) => segment.kind === 'day' && !segment.closedAt)
  useEffect(() => {
    if (deckNode === 'day' && !dayStillOpen) setDeckNode('dusk')
  }, [deckNode, dayStillOpen])

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
