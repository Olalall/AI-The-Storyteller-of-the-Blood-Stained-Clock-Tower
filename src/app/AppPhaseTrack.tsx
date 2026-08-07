/**
 * 顶部阶段轨道与它右侧的三个全局动作。
 *
 * 轨道只反映对局已经发生了什么，点它不推进相位——推进一律经由交接卡上的显式动作。
 */
import { Button } from '../components/ui/Button'
import { PhaseTrack } from '../components/ui/PhaseTrack'
import { projectEffectiveTimelineEntries } from '../features/game-session/state/projectTimelineHistory'
import { projectPhaseTrack } from '../features/game-session/state/projectPhaseTrack'
import type { DeckNode } from '../features/hosting-deck/deckNode'
import type { GameSessionState } from '../features/game-session/types'

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
  return (
    <PhaseTrack
      nodes={projectPhaseTrack(session, activeNode)}
      actions={(
        <>
          <Button variant="ghost" compact onClick={onOpenRecords}>
            本局记录 {projectEffectiveTimelineEntries(session.timeline).length}
          </Button>
          <Button variant="ghost" compact onClick={onToggleArchive}>
            {inArchive ? '回到主持台' : '本局'}
          </Button>
          <Button variant="ghost" compact onClick={onOpenGameEnd}>收尾</Button>
        </>
      )}
    />
  )
}
