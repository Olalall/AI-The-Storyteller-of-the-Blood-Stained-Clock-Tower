/**
 * 主持台按节点渲染：入口 → 黄昏 → 夜 → 黎明 → 白天。
 *
 * 节点由 deckNodeForSession 从对局本身推出来，这里只负责挑一个渲染，
 * 不做任何相位推进——推进一律经由交接卡上的显式动作。
 */
import { createPrototypeGameSession } from '../features/game-session/data/createPrototypeSession'
import { DawnHandoff } from '../features/hosting-deck/handoff/DawnHandoff'
import { DuskHandoff } from '../features/hosting-deck/handoff/DuskHandoff'
import { SessionEntry } from '../features/hosting-deck/SessionEntry'
import { deckNodeForSession, isFirstNight, latestNightSegmentId, nextDayLabel, nextNightLabel, type DeckNode } from '../features/hosting-deck/deckNode'
import { DayWorkbench } from '../features/day-workbench/DayWorkbench'
import { NightWorkbench } from '../features/night-workbench/NightWorkbench'
import type { GameSessionState } from '../features/game-session/types'
import type { GameSessionAction } from '../features/game-session/state/sessionActions'

interface DeckBodyProps {
  session: GameSessionState
  dispatch: (action: GameSessionAction) => void
  deckNode: DeckNode
  onDeckNodeChange: (node: DeckNode) => void
  /** 还没配过板的空对局显示入口界面；配板确认后才谈得上黄昏。 */
  hasStarted: boolean
  nightBinding: { session: GameSessionState; dispatchSession: (action: GameSessionAction) => void }
  onStartNight: () => void
  onStartDay: () => void
  onExitToArchive: () => void
  onOpenSetup: () => void
  onOpenScriptLibrary: () => void
  onOpenTimer: () => void
  onOpenPlayerStatus: (seatId: number) => void
}

export function DeckBody({
  session,
  dispatch,
  deckNode,
  onDeckNodeChange,
  hasStarted,
  nightBinding,
  onStartNight,
  onStartDay,
  onExitToArchive,
  onOpenSetup,
  onOpenScriptLibrary,
  onOpenTimer,
  onOpenPlayerStatus,
}: DeckBodyProps) {
  if (deckNode === 'dusk') {
    if (!hasStarted) {
      return (
        <SessionEntry
          onStartSetup={onOpenSetup}
          onOpenScriptLibrary={onOpenScriptLibrary}
          hostingMode={session.hostingMode}
          onSelectHostingMode={(mode) => dispatch({
            type: 'set-hosting-mode',
            mode,
            changedAt: new Date().toISOString(),
            phaseLabel: '开局前',
          })}
          onLoadDemo={() => {
            const demo = createPrototypeGameSession()
            dispatch({ type: 'replace-session', session: demo })
            onDeckNodeChange(deckNodeForSession(demo))
          }}
        />
      )
    }
    return (
      <DuskHandoff
        session={session}
        nightLabel={nextNightLabel(session)}
        isFirstNight={isFirstNight(session)}
        onStartNight={onStartNight}
      />
    )
  }

  if (deckNode === 'night') {
    return (
      <NightWorkbench
        sessionBinding={nightBinding}
        onExit={onExitToArchive}
        onCloseNight={() => onDeckNodeChange('dawn')}
      />
    )
  }

  if (deckNode === 'dawn') {
    return (
      <DawnHandoff
        session={session}
        nightSegmentId={latestNightSegmentId(session) ?? ''}
        dayLabel={nextDayLabel(session)}
        onStartDay={onStartDay}
        onOpenPlayerStatus={onOpenPlayerStatus}
      />
    )
  }

  return (
    <DayWorkbench
      session={session}
      dispatch={dispatch}
      onExit={onExitToArchive}
      onOpenTimer={onOpenTimer}
    />
  )
}
