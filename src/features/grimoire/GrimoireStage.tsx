/**
 * 魔典模式的主视图宿主：完整度条 + 遮蔽栏 + 座位环 + 核 + 工作抽屉。
 *
 * 它**替换**主持台中间那一层，而不是加在它旁边：原来占满整屏的工作台
 * （黄昏交接 / 夜间工作台 / 黎明播报 / 白天工作台）原样落进抽屉，一行代码都不改。
 * 这是「凡是需要在 grimoire 里重新实现一遍纯记录已有功能的设计，一律视为设计错误」
 * 那条规矩在这一层的执行点——本文件里没有任何一段是既有功能的第二份实现。
 *
 * 三条硬约束：
 * 1. 画布内零 dispatch（G1）。这一层唯一的 dispatch 是模式切换，且它发生在浮层里，
 *    不在环上。点座位只打开既有的 PlayerStatusSheet。
 * 2. 五个相位数字全部走投影（见 stage/corePhaseSources），算式绝不进 payload（裁决 10）。
 * 3. hostingMode 只在 App 层决定渲染哪个宿主，这一层拿到的就已经是「渲染魔典」这个结论。
 */
import { useMemo, useState, type ReactNode } from 'react'
import { GrimoireCanvas, type GrimoireCanvasSeat } from './GrimoireCanvas'
import { CompletenessBar } from './completeness/CompletenessBar'
import {
  isCompletenessVisible,
  completenessNotice,
  projectGrimoireCompleteness,
  NO_COMPLETENESS_DISMISSAL,
  type CompletenessDismissal,
} from './completeness/grimoireCompleteness'
import { WorkDrawer } from './drawer/WorkDrawer'
import { useGrimoireShield } from './shield/useGrimoireShield'
import { GrimoireShieldBar } from './stage/GrimoireShieldBar'
import { SessionInfoOverlay } from './stage/SessionInfoOverlay'
import {
  corePhaseFor,
  projectDawnRoll,
  projectDayTimer,
  projectDuskBrief,
  projectGhostVotesRemaining,
  projectNightCursor,
  projectVoteTally,
} from './stage/corePhaseSources'
import { useDiscussionTimer } from '../day-workbench/state/useDiscussionTimer'
import { projectStorytellerSeatSummaries } from '../game-session/state/projectors'
import { latestNightSegmentId, type DeckNode } from '../hosting-deck/deckNode'
import { scriptDisplayName } from '../../domain/scripts'
import type { GameSessionAction } from '../game-session/state/sessionActions'
import type { GameSessionState } from '../game-session/types'
import './stage/grimoire-stage.css'

interface GrimoireStageProps {
  session: GameSessionState
  dispatch: (action: GameSessionAction) => void
  deckNode: DeckNode
  onOpenSetup: () => void
  onOpenScriptLibrary: () => void
  /** 「逐条核对」的落点：本局记录。补录本身是 G2 的补录建议卡，本批只把人送到记录前。 */
  onOpenRecords: () => void
  onOpenPlayerStatus: (seatId: number) => void
  /** 当前节点的工作台或交接卡，原样落进抽屉。 */
  children: ReactNode
}

/** 抽屉顶部常驻的手势契约。暗光下说书人只有余裕记「点下去 = 做当前这一步」。 */
const GESTURE_CONTRACT: Record<DeckNode, string> = {
  dusk: '点座位 = 打开座位卡；环上不改状态',
  night: '点座位 = 打开座位卡；夜间记录在抽屉里确认',
  dawn: '点座位 = 打开座位卡；生死由你更新，工具不反推',
  day: '点座位 = 打开座位卡；提名与票型在抽屉里记',
}

const DRAWER_LABEL: Record<DeckNode, string> = {
  dusk: '黄昏交接',
  night: '夜间步骤台',
  dawn: '黎明播报',
  day: '白天步骤台',
}

/**
 * 每个相位进来时抽屉停在哪一档。
 *
 * 两张交接卡开 full：它们是相位门，此刻要读的是清单而不是看环。
 * 夜与白天开 half：环在这两段里是主视图（夜序光标、提名与举手都在环上），
 * 抽屉只放当前这一步。档位是**相位的属性**而不是抽屉的遗留状态——
 * 散着不管的话，说书人上一段把抽屉拖回 peek，下一段的交接卡就只露出一条 96px 的缝。
 */
const DRAWER_DETENT: Record<DeckNode, 'peek' | 'half' | 'full'> = {
  dusk: 'full',
  night: 'half',
  dawn: 'full',
  day: 'half',
}

export function GrimoireStage({
  session,
  dispatch,
  deckNode,
  onOpenSetup,
  onOpenScriptLibrary,
  onOpenRecords,
  onOpenPlayerStatus,
  children,
}: GrimoireStageProps) {
  const shield = useGrimoireShield()
  const timer = useDiscussionTimer()
  const [infoOpen, setInfoOpen] = useState(false)
  const [dismissal, setDismissal] = useState<CompletenessDismissal>(NO_COMPLETENESS_DISMISSAL)

  const seats: GrimoireCanvasSeat[] = useMemo(
    () => projectStorytellerSeatSummaries(session).map((seat) => ({
      seatId: seat.seatId,
      nickname: seat.nickname,
      state: seat.state,
      role: seat.role
        ? { roleId: seat.role.id, name: seat.role.name, initial: seat.role.initial, imageSrc: seat.role.iconPath }
        : null,
    })),
    [session],
  )

  const phase = corePhaseFor(deckNode, session)
  // 每个相位只算自己那一份：黄昏的队列预览要现建一份下一夜的队列，
  // 在夜里或白天算它纯属浪费，而它是这几个投影里唯一不便宜的。
  const night = useMemo(() => phase === 'night' ? projectNightCursor(session) : null, [phase, session])
  const dusk = useMemo(() => phase === 'dusk' ? projectDuskBrief(session) : undefined, [phase, session])
  const dawn = useMemo(() => {
    if (phase !== 'dawn') return undefined
    const segmentId = latestNightSegmentId(session)
    return segmentId ? projectDawnRoll(session, segmentId) : { deaths: null }
  }, [phase, session])

  const completeness = useMemo(() => projectGrimoireCompleteness(session), [session])
  const notice = completenessNotice(completeness)
  // 抽屉档位、遮蔽级别、浮层开关都会让这一层重渲，而这个投影要走一遍整条 timeline。
  const ghostVotesRemaining = useMemo(() => projectGhostVotesRemaining(session), [session])

  return (
    <div className="grimoire-stage">
      {isCompletenessVisible(notice, completeness, dismissal) ? (
        <CompletenessBar
          completeness={completeness}
          onOpenSetup={onOpenSetup}
          onReview={onOpenRecords}
          onDefer={() => setDismissal({ silenced: false, deferredAtHints: completeness.pendingStateHints })}
          onSilence={() => setDismissal({ silenced: true, deferredAtHints: null })}
        />
      ) : null}

      <GrimoireShieldBar shield={shield} />

      <GrimoireCanvas
        seats={seats}
        shield={shield.level}
        actionHint="打开座位卡"
        onSelectSeat={onOpenPlayerStatus}
        onBlindCover={shield.coverNow}
        scriptName={scriptDisplayName(session.scriptId)}
        onOpenSessionInfo={() => setInfoOpen(true)}
        phase={phase}
        night={night?.cursor}
        pendingCount={night?.pendingCount ?? null}
        ghostVotesRemaining={ghostVotesRemaining}
        timer={phase === 'day-timer' ? projectDayTimer(timer) : undefined}
        vote={phase === 'day-vote' ? projectVoteTally(session) : undefined}
        dusk={dusk}
        dawn={dawn}
      />

      {/* key 按相位：换相位就是换一张工作台，档位必须跟着新的那一张走，
          而不是留在上一段被拖到的位置。同一相位内 key 不变，说书人拖出来的档位照旧算数。 */}
      <WorkDrawer
        key={deckNode}
        gestureContract={GESTURE_CONTRACT[deckNode]}
        label={DRAWER_LABEL[deckNode]}
        defaultDetent={DRAWER_DETENT[deckNode]}
      >
        {children}
      </WorkDrawer>

      <SessionInfoOverlay
        open={infoOpen}
        onOpenChange={setInfoOpen}
        session={session}
        dispatch={dispatch}
        onOpenScriptLibrary={onOpenScriptLibrary}
      />
    </div>
  )
}
