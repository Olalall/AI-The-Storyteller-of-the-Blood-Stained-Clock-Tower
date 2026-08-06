/**
 * 魔典模式的主视图宿主：回执带 + 完整度条 + 遮蔽栏 + 座位环 + 核 + 工作抽屉。
 *
 * 它**替换**主持台中间那一层，而不是加在它旁边：原来占满整屏的工作台
 * （黄昏交接 / 夜间工作台 / 黎明播报 / 白天工作台）原样落进抽屉，一行代码都不改。
 * 这是「凡是需要在 grimoire 里重新实现一遍纯记录已有功能的设计，一律视为设计错误」
 * 那条规矩在这一层的执行点——本文件里没有任何一段是既有功能的第二份实现。
 *
 * 三条硬约束：
 * 1. 环上的写入一律走草稿两段式（G2）。这一层的所有座位手势都只产生草稿，
 *    真正的 dispatch 只有 useGrimoireWriteLayer.commit 一处，且与回执绑在一起。
 * 2. 五个相位数字全部走投影（见 stage/corePhaseSources），算式绝不进 payload（裁决 10）。
 * 3. hostingMode 只在 App 层决定渲染哪个宿主，这一层拿到的就已经是「渲染魔典」这个结论。
 */
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { GrimoireCanvas, type GrimoireCanvasSeat } from './GrimoireCanvas'
import { useRingBindings } from './stage/useRingBindings'
import { renderSeatAnchorWith } from './stage/seatAnchor'
import { ReplayHonestyBar } from './replay/ReplayHonestyBar'
import { CompletenessBar } from './completeness/CompletenessBar'
import {
  isCompletenessVisible,
  completenessNotice,
  projectGrimoireCompleteness,
  NO_COMPLETENESS_DISMISSAL,
  type CompletenessDismissal,
} from './completeness/grimoireCompleteness'
import { BackfillReviewPanel } from './backfill/BackfillReviewPanel'
import { projectBackfillCards, type BackfillCard } from './backfill/backfillHints'
import { WorkDrawer } from './drawer/WorkDrawer'
import type { WorkDrawerDetent } from './drawer/detents'
import { useGrimoireShield } from './shield/useGrimoireShield'
import { GrimoireShieldBar } from './stage/GrimoireShieldBar'
import { SessionInfoOverlay } from './stage/SessionInfoOverlay'
import { GrimoireReceiptBar } from './write/GrimoireReceiptBar'
import { SeatActionDrawerPath } from './write/SeatActionDrawerPath'
import { SeatConfirmBar } from './write/SeatConfirmBar'
import { useGrimoireWriteLayer } from './write/useGrimoireWriteLayer'
import { useSeatWriteBindings } from './write/useSeatWriteBindings'
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
import { projectCurrentPlayerStates, projectStorytellerSeatSummaries } from '../game-session/state/projectors'
import { latestNightSegmentId, type DeckNode } from '../hosting-deck/deckNode'
import { scriptDisplayName } from '../../domain/scripts'
import { readGrimoirePromptPreferences, silenceGrimoireCompletenessPrompt } from '../../services/settings/grimoirePromptPreferences'
import { shieldVisibility } from './shield/shieldLevel'
import type { GameSessionAction } from '../game-session/state/sessionActions'
import type { GameSessionState } from '../game-session/types'
import './stage/grimoire-stage.css'

export interface GrimoireStageProps {
  session: GameSessionState
  dispatch: (action: GameSessionAction) => void
  deckNode: DeckNode
  onOpenSetup: () => void
  onOpenScriptLibrary: () => void
  /** 本局记录。补录建议卡接管了完整度条上的「逐条核对」，这个入口仍留给别处。 */
  onOpenRecords: () => void
  onOpenPlayerStatus: (seatId: number) => void
  /**
   * SeatActionBar 第五格。缺省时退到座位卡——PlayerStatusBar 里本来就有「更换角色」，
   * 一跳可达。这是过渡桥，真正的目标是 App 层直接把 RoleChangeSheet 挂上来。
   */
  onOpenRoleChange?: (seatId: number) => void
  /** 夜间工作台的会话绑定。环上点座位选目标要走它，才能与抽屉共用同一个 reducer。 */
  nightBinding: { session: GameSessionState; dispatchSession: (action: GameSessionAction) => void }
  /** 当前节点的工作台或交接卡，原样落进抽屉。 */
  children: ReactNode
}

/** 抽屉顶部常驻的手势契约。暗光下说书人只有余裕记「点下去 = 做当前这一步」。 */
const GESTURE_CONTRACT: Record<DeckNode, string> = {
  dusk: '点座位 = 座位操作；点完只是草稿，抽屉里确认才落账',
  night: '点座位 = 座位操作；夜间记录仍在抽屉里确认',
  dawn: '点座位 = 座位操作；生死由你更新，工具不反推',
  day: '点座位 = 座位操作；提名与票型在抽屉里记',
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
/**
 * 每个节点进来时抽屉停在哪一档。
 *
 * 夜与昼停在 half：环是主视图，但抽屉里那张工作台的主动作（「检查并关闭」
 * 「结束今天」）也必须够得到，peek 的 96px 装不下它们。
 * half 的高度本身被收窄过——见 detents 里的说明，46dvh 会把环挤成网格。
 * 黄昏与黎明是交接卡，那两步本来就该占满整屏，环让位。
 */
const DRAWER_DETENT: Record<DeckNode, 'peek' | 'half' | 'full'> = {
  dusk: 'full',
  night: 'half',
  dawn: 'full',
  day: 'half',
}

export function GrimoireStageBody({
  session,
  dispatch,
  deckNode,
  nightBinding,
  onOpenSetup,
  onOpenScriptLibrary,
  onOpenRecords,
  onOpenPlayerStatus,
  onOpenRoleChange,
  children,
}: GrimoireStageProps) {
  const shield = useGrimoireShield()
  const timer = useDiscussionTimer()
  /* 舞台要按抽屉当前占多高来留白，所以它得知道档位；换相位时跟着新工作台的默认档走。 */
  const [drawerDetent, setDrawerDetent] = useState<WorkDrawerDetent>(DRAWER_DETENT[deckNode])
  useEffect(() => setDrawerDetent(DRAWER_DETENT[deckNode]), [deckNode])

  const [infoOpen, setInfoOpen] = useState(false)
  const [dismissal, setDismissal] = useState<CompletenessDismissal>(
    // 「不再提示」按过就跨会话闭嘴。只活在组件 state 里的话，刷新一次就又冒出来，
    // 而它的触发条件在一局里通常一直成立——被反复无效化之后人学到的是「这条提示不用看」。
    () => readGrimoirePromptPreferences().completenessSilenced
      ? { silenced: true, deferredAtHints: null }
      : NO_COMPLETENESS_DISMISSAL,
  )
  const [reviewOpen, setReviewOpen] = useState(false)
  const [skipped, setSkipped] = useState<ReadonlySet<string>>(new Set())

  const write = useGrimoireWriteLayer(session, dispatch)
  const bindings = useSeatWriteBindings(write, deckNode)

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
  const playerStates = useMemo(() => projectCurrentPlayerStates(session), [session])
  const backfillCards = useMemo(
    () => projectBackfillCards(session, completeness, playerStates),
    [completeness, playerStates, session],
  )
  // 抽屉档位、遮蔽级别、浮层开关都会让这一层重渲，而这个投影要走一遍整条 timeline。
  const ghostVotesRemaining = useMemo(() => projectGhostVotesRemaining(session), [session])

  const markBackfill = (card: BackfillCard) => write.commitBackfill({
    seatId: card.seatId,
    draft: card.draft,
    backfill: card.backfill,
    reason: card.reason,
  })

  const openRoleChange = onOpenRoleChange ?? onOpenPlayerStatus
  // L0 是「立刻盖住一切」的手势，必须绝对：抽屉里托管的是既有全屏页
  // （夜间工作台会显示角色名、黄昏交接会显示恶魔的三张伪装），
  // 而画布的遮蔽管不到抽屉。所以 L0 下抽屉内容**整段不进 DOM**，不是视觉遮住。
  const ring = useRingBindings({
    session,
    dispatch,
    deckNode,
    seatIds: seats.map((seat) => seat.seatId),
    shield: shield.level,
    nightBinding,
    notify: write.notify,
    openActionBar: bindings.openActionBar,
  })

  const drawerVisible = shieldVisibility(shield.level).seatIdentity

  return (
    /* 留白值写在 CSS 里按 data-drawer 分档，不在这里算：
       算一遍就等于把 detents.ts 的三档高度抄成第二份，两份必然漂移。 */
    <div className="grimoire-stage" data-drawer={drawerDetent}>
      <GrimoireReceiptBar receipt={write.receipt} onUndo={write.undo} />

      {isCompletenessVisible(notice, completeness, dismissal) ? (
        <CompletenessBar
          completeness={completeness}
          onOpenSetup={onOpenSetup}
          onReview={() => setReviewOpen(true)}
          onDefer={() => setDismissal({ silenced: false, deferredAtHints: completeness.pendingStateHints })}
          onSilence={() => {
            silenceGrimoireCompletenessPrompt()
            setDismissal({ silenced: true, deferredAtHints: null })
          }}
        />
      ) : null}

      {reviewOpen && drawerVisible ? (
        <BackfillReviewPanel
          cards={backfillCards}
          skipped={skipped}
          onMark={markBackfill}
          onSkip={(card) => setSkipped((current) => new Set(current).add(card.id))}
          onClose={() => setReviewOpen(false)}
          onOpenRecords={onOpenRecords}
        />
      ) : null}

      <ReplayHonestyBar context={{ archive: null, viewMode: 'grimoire' }} />
      <GrimoireShieldBar shield={shield} />

      <GrimoireCanvas
        seats={seats}
        shield={shield.level}
        actionHint={ring.actionHint}
        onSelectSeat={ring.onSelectSeat}
        seatOverlays={ring.seatOverlays}
        selectedSeatIds={ring.day.selectedSeatIds}
        renderRingOverlay={ring.renderRingOverlay}
        onSeatHold={bindings.openActionBar}
        onChipGesture={bindings.handleChipGesture}
        ghostsBySeat={write.ghostsBySeat}
        ghostLifeBySeat={write.ghostLifeBySeat}
        anchoredSeatId={bindings.actionBarSeatId}
        renderSeatAnchor={renderSeatAnchorWith({ playerStates, bindings, onOpenRoleChange: openRoleChange, onOpenSeatCard: onOpenPlayerStatus })}
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
        onDetentChange={setDrawerDetent}
        gestureContract={ring.gestureContract ?? GESTURE_CONTRACT[deckNode]}
        label={DRAWER_LABEL[deckNode]}
        defaultDetent={DRAWER_DETENT[deckNode]}
        peekSlot={write.projected && drawerVisible ? {
          kind: 'seat-state-confirm',
          label: `确认 ${write.projected.seatId}号 状态`,
          content: (
            <SeatConfirmBar
              projected={write.projected}
              segments={write.segments}
              segmentId={write.segmentId}
              onSegmentChange={write.setSegmentId}
              onConfirm={write.confirmDraft}
              onCancel={write.clearDraft}
            />
          ),
        } : undefined}
      >
        {drawerVisible ? (
          <>
            <SeatActionDrawerPath
              seatIds={seats.map((seat) => seat.seatId)}
              playerStates={playerStates}
              markerDetail={shieldVisibility(shield.level).markerDetail}
              onDraft={bindings.draftFromCell}
              onAddMarker={bindings.addMarker}
              onRemoveMarker={bindings.removeMarker}
              onOpenRoleChange={openRoleChange}
              onOpenSeatCard={onOpenPlayerStatus}
            />
            {children}
          </>
        ) : (
          <p className="grimoire-stage__drawer-blackout" role="status">魔典已盖上 · 抽屉内容已收起</p>
        )}
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


