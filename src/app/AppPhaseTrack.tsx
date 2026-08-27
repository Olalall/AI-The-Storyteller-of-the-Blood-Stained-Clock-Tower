/**
 * 顶部阶段轨道与它右侧的三个全局动作。
 *
 * 轨道只反映对局已经发生了什么，点它不推进相位——推进一律经由交接卡上的显式动作。
 */
import { Flag, MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { PhaseTrack } from '../components/ui/PhaseTrack'
import { Sheet } from '../components/ui/Sheet'
import { projectEffectiveTimelineEntries } from '../features/game-session/state/projectTimelineHistory'
import { projectPhaseTrack } from '../features/game-session/state/projectPhaseTrack'
import type { DeckNode } from '../features/hosting-deck/deckNode'
import { NewUserGuideSheet } from '../features/hosting-deck/NewUserGuideSheet'
import type { GameSessionState } from '../features/game-session/types'
import './app-phase-track.css'

interface AppPhaseTrackProps {
  session: GameSessionState
  /** 档案视图下不高亮任何节点：此刻看的是历史，不是当前所在的相位。 */
  activeNode?: DeckNode
  inArchive: boolean
  onOpenRecords: () => void
  onToggleArchive: () => void
  onOpenGameEnd: () => void
}

export function AppPhaseTrack({
  session,
  activeNode,
  inArchive,
  onOpenRecords,
  onToggleArchive,
  onOpenGameEnd,
}: AppPhaseTrackProps) {
  const [moreOpen, setMoreOpen] = useState(false)
  const phaseNodes = projectPhaseTrack(session, activeNode)
  const currentNodeId = activeNode === 'day'
    ? phaseNodes.filter((node) => node.status === 'open').at(-1)?.id ?? activeNode
    : activeNode

  return (
    <PhaseTrack
      nodes={phaseNodes}
      currentNodeId={currentNodeId}
      actions={(
        <>
          <Button variant="ghost" compact onClick={onOpenRecords}>
            本局记录 {projectEffectiveTimelineEntries(session.timeline).length}
          </Button>
          <Button variant="ghost" compact onClick={onToggleArchive}>
            {inArchive ? '回到主持台' : '本局'}
          </Button>
          <Sheet
            open={moreOpen}
            onOpenChange={setMoreOpen}
            title="更多主持功能"
            description="教学与对局收尾"
            contentClassName="sheet-content--app-more"
            trigger={<Button variant="ghost" compact><MoreHorizontal aria-hidden="true" />更多</Button>}
          >
            <div className="app-phase-more__menu">
              <NewUserGuideSheet layer="nested" />
              <Button
                variant="ghost"
                compact
                className="app-phase-more__game-end"
                onClick={() => {
                  setMoreOpen(false)
                  onOpenGameEnd()
                }}
              >
                <Flag aria-hidden="true" />收尾与复盘
              </Button>
            </div>
          </Sheet>
        </>
      )}
    />
  )
}
