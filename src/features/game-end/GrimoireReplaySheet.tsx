/**
 * 在魔典里回看一局归档。
 *
 * 这里**没有**第二套魔典：渲染的就是主持时那张画布，只是喂给它归档里的 session，
 * 并把 replay 上下文传进去。上下文一到位，两件事同时发生——顶上常驻诚实条，
 * 所有写入入口被 sealGrimoireWrite 自上而下封死。
 *
 * 为什么值得单独有这条路：一局纯记录模式主持的对局，魔典上大半是空的。
 * 不标注的话，回看的人会把「当时没人录」读成「当时没发生」——
 * 而复盘正是靠这些空白与非空白做判断的。
 */
import { Sheet } from '../../components/ui/Sheet'
import { GrimoireStage } from '../grimoire/GrimoireStageHost'
import { ReplayHonestyBar, resolveWriteAccess } from '../grimoire/replay'
import { deckNodeForSession } from '../hosting-deck/deckNode'
import type { GameArchiveRecord } from '../../services/archive'
import type { GameSessionAction } from '../game-session/state/sessionActions'

interface GrimoireReplaySheetProps {
  archive: GameArchiveRecord | null
  onOpenChange: (open: boolean) => void
}

/** 回看态没有写入方。留一个吞掉一切的 dispatch，好让类型不必为回看单开一条分支。 */
const NO_WRITES = (_action: GameSessionAction) => undefined

export function GrimoireReplaySheet({ archive, onOpenChange }: GrimoireReplaySheetProps) {
  if (!archive) return null
  const session = archive.session
  // 决定权在这里，不在画布里：画布只收下算好的闸门与造好的横条。
  const replayContext = {
    archive: {
      hostingMode: archive.hostingMode,
      hostingModeHistory: archive.hostingModeHistory,
      grimoireCompleteness: archive.grimoireCompleteness,
    },
    viewMode: 'grimoire' as const,
  }

  return (
    <Sheet
      open
      onOpenChange={onOpenChange}
      title={`在魔典里回看 · ${archive.scriptName}`}
      description="这是一局已经归档的对局，魔典上的一切都不可改。"
      presentation="page"
    >
      <GrimoireStage
        session={session}
        dispatch={NO_WRITES}
        deckNode={deckNodeForSession(session)}
        writeAccess={resolveWriteAccess(replayContext)}
        honestyBar={<ReplayHonestyBar context={replayContext} />}
        nightBinding={{ session, dispatchSession: NO_WRITES }}
        onOpenSetup={() => undefined}
        onOpenScriptLibrary={() => undefined}
        onOpenRecords={() => undefined}
        onOpenPlayerStatus={() => undefined}
      >
        <p className="grimoire-replay__hint">
          归档回看：抽屉里不挂工作台，因为这一局已经打完了。要看逐条记录请回到「本局记录」。
        </p>
      </GrimoireStage>
    </Sheet>
  )
}
