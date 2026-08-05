import { useMemo, useState } from 'react'
import { AppFrame } from './app/AppFrame'
import { PhaseTrack } from './components/ui/PhaseTrack'
import { Button } from './components/ui/Button'
import { projectPhaseTrack } from './features/game-session/state/projectPhaseTrack'
import { projectEffectiveTimelineEntries } from './features/game-session/state/projectTimelineHistory'
import { Dashboard } from './features/dashboard/Dashboard'
import { SessionRail } from './features/dashboard/components/SessionRail'
import { PlayerStatusOverlay } from './features/dashboard/components/PlayerStatusOverlay'
import { DayWorkbench } from './features/day-workbench/DayWorkbench'
import { PublicChatTimerPage } from './features/day-workbench/PublicChatTimerPage'
import { DiscussionTimerProvider } from './features/day-workbench/state/discussionTimer'
import { useGameSession } from './features/game-session/state/useGameSession'
import { GameEndSheet } from './features/game-end/GameEndSheet'
import { IdentityDealSheet } from './features/identity-deal/IdentityDealSheet'
import { NightWorkbench } from './features/night-workbench/NightWorkbench'
import { ScriptLibrarySheet } from './features/script-library/ScriptLibrarySheet'
import { SetupPanel } from './features/setup/SetupPanel'
import { clearIdentityDealReceipts } from './services/identity-deal'
import type { ScriptId } from './domain/scripts'
type View = 'dashboard' | 'night' | 'day' | 'timer'

function App() {
  const [view, setView] = useState<View>('dashboard')
  const [setupOpen, setSetupOpen] = useState(false)
  const [identityDealOpen, setIdentityDealOpen] = useState(false)
  const [gameEndOpen, setGameEndOpen] = useState(false)
  const [gameEndMode, setGameEndMode] = useState<'end' | 'review'>('end')
  const [scriptLibraryOpen, setScriptLibraryOpen] = useState(false)
  const [setupScriptId, setSetupScriptId] = useState<ScriptId>('catfishing')
  const [playerStatusSeatId, setPlayerStatusSeatId] = useState<number | null>(null)
  const { session, dispatch } = useGameSession()
  const nightBinding = useMemo(() => ({ session, dispatchSession: dispatch }), [session, dispatch])

  function enterNight() {
    const activeRun = session.activeNightRunId ? session.nightRuns[session.activeNightRunId] : undefined
    const segment = activeRun?.phaseSegmentId
      ? session.phaseSegments.find((item) => item.id === activeRun.phaseSegmentId)
      : undefined
    if (!activeRun || segment?.closedAt) dispatch({ type: 'start-next-night-run' })
    dispatch({ type: 'open-phase-segment', phaseKind: 'night', createdAt: new Date().toISOString() })
    setView('night')
  }

  function enterDay() {
    dispatch({ type: 'open-phase-segment', phaseKind: 'day', createdAt: new Date().toISOString() })
    setView('day')
  }

  function resetGame() {
    clearIdentityDealReceipts(session.id)
    setSetupScriptId(session.scriptId)
    dispatch({ type: 'reset-session' })
    setView('dashboard')
    setSetupOpen(true)
    setIdentityDealOpen(false)
    setGameEndOpen(false)
    setScriptLibraryOpen(false)
    setPlayerStatusSeatId(null)
  }

  return (
    <DiscussionTimerProvider key={session.id} sessionId={session.id}>
      <AppFrame
        rail={view === 'night' || view === 'day' ? <SessionRail session={session} onOpenPlayerStatus={setPlayerStatusSeatId} /> : undefined}
        phaseTrack={(
          <PhaseTrack
            nodes={projectPhaseTrack(session)}
            actions={(
              <>
                <Button variant="ghost" compact onClick={() => { setGameEndMode('review'); setGameEndOpen(true) }}>
                  本局记录 {projectEffectiveTimelineEntries(session.timeline).length}
                </Button>
                <Button variant="ghost" compact onClick={() => { setGameEndMode('end'); setGameEndOpen(true) }}>收尾</Button>
              </>
            )}
          />
        )}
      >
        {view === 'dashboard' ? <Dashboard session={session} dispatch={dispatch} onEnterNight={enterNight} onEnterDay={enterDay} onOpenTimer={() => setView('timer')} onOpenSetup={() => setSetupOpen(true)} onOpenIdentityDeal={() => setIdentityDealOpen(true)} onOpenGameEnd={(mode = 'end') => { setGameEndMode(mode); setGameEndOpen(true) }} onOpenScriptLibrary={() => setScriptLibraryOpen(true)} onOpenPlayerStatus={setPlayerStatusSeatId} /> : null}
        {view === 'night' ? <NightWorkbench sessionBinding={nightBinding} onExit={() => setView('dashboard')} /> : null}
        {view === 'day' ? <DayWorkbench session={session} dispatch={dispatch} onExit={() => setView('dashboard')} /> : null}
        {view === 'timer' ? <PublicChatTimerPage onExit={() => setView('dashboard')} /> : null}
        <SetupPanel open={setupOpen} onOpenChange={setSetupOpen} session={session} dispatch={dispatch} setupScriptId={setupScriptId} onSetupScriptChange={setSetupScriptId} />
        <IdentityDealSheet open={identityDealOpen} onOpenChange={setIdentityDealOpen} session={session} />
        <GameEndSheet open={gameEndOpen} onOpenChange={setGameEndOpen} session={session} initialMode={gameEndMode} onResetGame={resetGame} />
        <ScriptLibrarySheet open={scriptLibraryOpen} onOpenChange={setScriptLibraryOpen} session={session} onSelectScript={(scriptId) => { setSetupScriptId(scriptId); setSetupOpen(true) }} />
        <PlayerStatusOverlay seatId={playerStatusSeatId} session={session} dispatch={dispatch} onOpenChange={(open) => { if (!open) setPlayerStatusSeatId(null) }} />
      </AppFrame>
    </DiscussionTimerProvider>
  )
}

export default App
