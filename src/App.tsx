import { useCallback, useMemo, useState } from 'react'
import { AppFrame } from './app/AppFrame'
import { AppOverlays } from './app/AppOverlays'
import { AppPhaseTrack } from './app/AppPhaseTrack'
import { DeckBody } from './app/DeckBody'
import { useAppOverlays } from './app/useAppOverlays'
import { useDeckNavigation } from './app/useDeckNavigation'
import { useSessionImport } from './app/useSessionImport'
import { Dashboard } from './features/dashboard/Dashboard'
import { SessionRail } from './features/dashboard/components/SessionRail'
import { DiscussionTimerProvider } from './features/day-workbench/state/discussionTimer'
import { useGameSession } from './features/game-session/state/useGameSession'
import { useSessionDurability, useSessionWriteLock } from './features/game-session/state/useSessionDurability'
import { DurabilityNotices } from './features/game-session/components/DurabilityNotices'
import { PWAStatusNotices } from './features/pwa/PWAStatusNotices'
import { PWAInstallProvider } from './features/pwa/PWAInstallProvider'
import { deckNodeForSession } from './features/hosting-deck/deckNode'
import { SessionImportUndoNotice } from './features/ai-settings/SessionImportUndoNotice'

type View = 'deck' | 'archive'

function App() {
  const [view, setView] = useState<View>('deck')
  const writeLock = useSessionWriteLock()
  const { session, dispatch } = useGameSession(writeLock === 'owner')
  const guardedDispatch = useCallback<typeof dispatch>((action) => {
    if (writeLock === 'owner') dispatch(action)
  }, [dispatch, writeLock])
  const overlays = useAppOverlays()
  const durability = useSessionDurability(session, guardedDispatch, { lock: writeLock })
  const { deckNode, setDeckNode, enterNight, enterDay, resetGame } =
    useDeckNavigation(session, guardedDispatch, overlays, () => setView('deck'))
  // 还没配过板的空对局显示入口界面；配板确认后才谈得上黄昏。
  const hasStarted = session.playerCount > 0
  const nightBinding = useMemo(() => ({ session, dispatchSession: guardedDispatch }), [session, guardedDispatch])
  const sessionImport = useSessionImport(session, guardedDispatch, (imported) => {
    setDeckNode(deckNodeForSession(imported))
    overlays.closeAll()
    setView('deck')
  })

  return (
    <PWAInstallProvider>
      <DiscussionTimerProvider key={session.id} sessionId={session.id}>
      <AppFrame
        /* 魔典模式不挂侧轨：它与座位环重复，而且舞台遮蔽无法覆盖侧轨私密信息。 */
        rail={writeLock === 'owner' && view === 'deck' && session.hostingMode !== 'grimoire' && (deckNode === 'night' || deckNode === 'day')
          ? <SessionRail session={session} onOpenPlayerStatus={overlays.setPlayerStatusSeatId} />
          : undefined}
        phaseTrack={writeLock === 'owner' && hasStarted ? (
          <AppPhaseTrack
            session={session}
            activeNode={view === 'deck' && hasStarted ? deckNode : undefined}
            inArchive={view === 'archive'}
            onOpenRecords={() => overlays.setRecordsOpen(true)}
            onToggleArchive={() => setView(view === 'archive' ? 'deck' : 'archive')}
            onOpenGameEnd={() => overlays.openGameEnd('end')}
          />
        ) : undefined}
      >
        <PWAStatusNotices hasStarted={hasStarted} />
        <DurabilityNotices durability={durability} />
        {/* 档案打开时卸载主持台，避免读屏和键盘进入背后的重复 DOM。 */}
        <div className="app-frame__interactive" inert={writeLock === 'readonly'}>
        {sessionImport.previousSession ? (
          <SessionImportUndoNotice onUndo={sessionImport.undo} onDismiss={sessionImport.dismissUndo} />
        ) : null}
        <div className="app-frame__deck" hidden={view === 'archive'}>
          {view === 'deck' ? (
            <DeckBody
              session={session}
              dispatch={guardedDispatch}
              deckNode={deckNode}
              onDeckNodeChange={setDeckNode}
              hasStarted={hasStarted}
              nightBinding={nightBinding}
              onStartNight={enterNight}
              onStartDay={enterDay}
              onExitToArchive={() => setView('archive')}
              onOpenSetup={() => overlays.setSetupOpen(true)}
              onOpenScriptLibrary={() => overlays.setScriptLibraryOpen(true)}
              onOpenTimer={() => overlays.setTimerOpen(true)}
              onOpenRecords={() => overlays.setRecordsOpen(true)}
              onOpenPlayerStatus={overlays.setPlayerStatusSeatId}
              onImportSession={sessionImport.apply}
            />
          ) : null}
        </div>
        {view === 'archive' ? (
          <Dashboard
            session={session}
            dispatch={guardedDispatch}
            onEnterNight={enterNight}
            onEnterDay={enterDay}
            onOpenTimer={() => overlays.setTimerOpen(true)}
            onOpenSetup={() => overlays.setSetupOpen(true)}
            onOpenIdentityDeal={() => overlays.setIdentityDealOpen(true)}
            onOpenGameEnd={overlays.openGameEnd}
            onOpenScriptLibrary={() => overlays.setScriptLibraryOpen(true)}
            onOpenPlayerStatus={overlays.setPlayerStatusSeatId}
            onImportSession={sessionImport.apply}
            onExitArchive={() => setView('deck')}
          />
        ) : null}
        <AppOverlays
          overlays={overlays}
          session={session}
          dispatch={guardedDispatch}
          onOpenDayWorkbench={enterDay}
          onResetGame={resetGame}
        />
        </div>
      </AppFrame>
      </DiscussionTimerProvider>
    </PWAInstallProvider>
  )
}

export default App
