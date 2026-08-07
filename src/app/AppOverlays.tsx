/** 全局面板栈。它们与主持台节点无关，任何相位下都可能被打开。 */
import { GameEndSheet } from '../features/game-end/GameEndSheet'
import { IdentityDealSheet } from '../features/identity-deal/IdentityDealSheet'
import { PlayerStatusOverlay } from '../features/dashboard/components/PlayerStatusOverlay'
import { PublicChatTimerPage } from '../features/day-workbench/PublicChatTimerPage'
import { ScriptLibrarySheet } from '../features/script-library/ScriptLibrarySheet'
import { SetupPanel } from '../features/setup/SetupPanel'
import { TimelineHistorySheet } from '../features/history/TimelineHistorySheet'
import type { AppOverlayState } from './useAppOverlays'
import type { GameSessionState } from '../features/game-session/types'
import type { GameSessionAction } from '../features/game-session/state/sessionActions'

interface AppOverlaysProps {
  overlays: AppOverlayState
  session: GameSessionState
  dispatch: (action: GameSessionAction) => void
  onOpenDayWorkbench: () => void
  onResetGame: () => void
}

export function AppOverlays({ overlays, session, dispatch, onOpenDayWorkbench, onResetGame }: AppOverlaysProps) {
  return (
    <>
      {overlays.timerOpen ? <PublicChatTimerPage onExit={() => overlays.setTimerOpen(false)} /> : null}
      <SetupPanel
        open={overlays.setupOpen}
        onOpenChange={overlays.setSetupOpen}
        session={session}
        dispatch={dispatch}
        setupScriptId={overlays.setupScriptId}
        onSetupScriptChange={overlays.setSetupScriptId}
      />
      <IdentityDealSheet open={overlays.identityDealOpen} onOpenChange={overlays.setIdentityDealOpen} session={session} />
      <GameEndSheet
        open={overlays.gameEndOpen}
        onOpenChange={overlays.setGameEndOpen}
        session={session}
        initialMode={overlays.gameEndMode}
        onResetGame={onResetGame}
      />
      <ScriptLibrarySheet
        open={overlays.scriptLibraryOpen}
        onOpenChange={overlays.setScriptLibraryOpen}
        session={session}
        onSelectScript={(scriptId) => {
          overlays.setSetupScriptId(scriptId)
          overlays.setSetupOpen(true)
        }}
      />
      <TimelineHistorySheet
        session={session}
        dispatch={dispatch}
        open={overlays.recordsOpen}
        onOpenChange={overlays.setRecordsOpen}
        onOpenPlayerStatus={overlays.setPlayerStatusSeatId}
        onOpenDayWorkbench={onOpenDayWorkbench}
        onOpenSetup={() => overlays.setSetupOpen(true)}
      />
      <PlayerStatusOverlay
        seatId={overlays.playerStatusSeatId}
        session={session}
        dispatch={dispatch}
        onOpenChange={(open) => { if (!open) overlays.setPlayerStatusSeatId(null) }}
      />
    </>
  )
}
