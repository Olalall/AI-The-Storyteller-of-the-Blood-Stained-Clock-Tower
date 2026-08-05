import { useMemo, useState } from 'react'
import { AppFrame } from './app/AppFrame'
import { AppOverlays } from './app/AppOverlays'
import { AppPhaseTrack } from './app/AppPhaseTrack'
import { DeckBody } from './app/DeckBody'
import { useAppOverlays } from './app/useAppOverlays'
import { useDeckNavigation } from './app/useDeckNavigation'
import { Dashboard } from './features/dashboard/Dashboard'
import { SessionRail } from './features/dashboard/components/SessionRail'
import { DiscussionTimerProvider } from './features/day-workbench/state/discussionTimer'
import { useGameSession } from './features/game-session/state/useGameSession'
import { useSessionDurability } from './features/game-session/state/useSessionDurability'
import { DurabilityNotices } from './features/game-session/components/DurabilityNotices'

/** 顶层只有主持台与档案两个视图：档案是覆盖层，主持台在其后保持挂载。 */
type View = 'deck' | 'archive'

function App() {
  const [view, setView] = useState<View>('deck')
  const { session, dispatch } = useGameSession()
  const overlays = useAppOverlays()
  const durability = useSessionDurability(session, dispatch)
  const { deckNode, setDeckNode, enterNight, enterDay, resetGame } =
    useDeckNavigation(session, dispatch, overlays, () => setView('deck'))
  // 还没配过板的空对局显示入口界面；配板确认后才谈得上黄昏。
  const hasStarted = session.playerCount > 0
  const nightBinding = useMemo(() => ({ session, dispatchSession: dispatch }), [session, dispatch])

  return (
    <DiscussionTimerProvider key={session.id} sessionId={session.id}>
      <AppFrame
        rail={view === 'deck' && (deckNode === 'night' || deckNode === 'day')
          ? <SessionRail session={session} onOpenPlayerStatus={overlays.setPlayerStatusSeatId} />
          : undefined}
        phaseTrack={(
          <AppPhaseTrack
            session={session}
            activeNode={view === 'deck' && hasStarted ? deckNode : undefined}
            inArchive={view === 'archive'}
            onOpenRecords={() => overlays.setRecordsOpen(true)}
            onToggleArchive={() => setView(view === 'archive' ? 'deck' : 'archive')}
            onOpenGameEnd={() => overlays.openGameEnd('end')}
          />
        )}
      >
        <DurabilityNotices durability={durability} />
        {/* 档案打开时卸载主持台：覆盖层背后留一份完整 DOM 会让同名内容出现两份，
            读屏与键盘也仍能走进去。deckNode 保存在 App 上，返回时回到原节点。 */}
        <div className="app-frame__deck" hidden={view === 'archive'}>
          {view === 'deck' ? (
            <DeckBody
              session={session}
              dispatch={dispatch}
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
              onOpenPlayerStatus={overlays.setPlayerStatusSeatId}
            />
          ) : null}
        </div>
        {view === 'archive' ? (
          <Dashboard
            session={session}
            dispatch={dispatch}
            onEnterNight={enterNight}
            onEnterDay={enterDay}
            onOpenTimer={() => overlays.setTimerOpen(true)}
            onOpenSetup={() => overlays.setSetupOpen(true)}
            onOpenIdentityDeal={() => overlays.setIdentityDealOpen(true)}
            onOpenGameEnd={overlays.openGameEnd}
            onOpenScriptLibrary={() => overlays.setScriptLibraryOpen(true)}
            onOpenPlayerStatus={overlays.setPlayerStatusSeatId}
            onExitArchive={() => setView('deck')}
          />
        ) : null}
        <AppOverlays
          overlays={overlays}
          session={session}
          dispatch={dispatch}
          onOpenDayWorkbench={enterDay}
          onResetGame={resetGame}
        />
      </AppFrame>
    </DiscussionTimerProvider>
  )
}

export default App
