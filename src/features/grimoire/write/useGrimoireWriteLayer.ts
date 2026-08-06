/**
 * 魔典写入层的**唯一**出口。
 *
 * 这个 hook 存在的核心理由是验收③：「魔典上无回执的静默写入数为 0」。
 * 让每个入口各自 dispatch，回执就变成一件要靠自觉记得做的事，而漏掉一次的表现是
 * ——什么都没发生。说书人以为记上了，直接喊了闭眼。
 * 所以把 dispatch 与回执**绑成同一个函数**：commit 之外没有第二处能写状态，
 * 想静默写入就得先绕开这个文件，而绕开是一次显眼的改动（有专门的结构性测试盯着）。
 *
 * 撤销走 revertOf 链，追加一条新记录把投影推回操作前，两条记录都留在历史里。
 * 禁止 state 快照回退、禁止从 timeline 删条目：已经发生过的事不该从档案里消失。
 */
import { useCallback, useMemo, useState } from 'react'
import { projectCurrentPlayerStates, projectOpenSegmentLabels } from '../../game-session/state/projectors'
import {
  buildGrimoireRevert,
  buildGrimoireWrite,
  projectSeatDraft,
  type ProjectedSeatWrite,
  type SeatStateDraft,
} from './seatDraft'
import type { GameSessionAction } from '../../game-session/state/sessionActions'
import type { GameSessionState } from '../../game-session/types'
import type { PlayerStateBackfill, PlayerStateChangedEntry } from '../../game-session/model/playerTypes'
import type { SeatGhostChip } from '../seat/seatChips'

/** 回执。message 进 live region，undoEntryId 决定那颗撤销键出不出现。 */
export interface GrimoireReceipt {
  /** 每次落账换一个，好让同一句话再次出现时也重新播报、重新起 3.5 秒。 */
  id: number
  message: string
  /** 可撤销的那条记录；null = 这条回执没有即时撤销（例如撤销本身的回执、失败回执）。 */
  undoEntryId: string | null
}

function newEntryId(prefix: string) {
  const suffix = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
  return `${prefix}-${suffix}`
}

export interface GrimoireWriteLayer {
  draft: SeatStateDraft | null
  projected: ProjectedSeatWrite | null
  setDraft: (draft: SeatStateDraft) => void
  clearDraft: () => void
  segmentId: string | null
  setSegmentId: (segmentId: string | null) => void
  segments: readonly { id: string; label: string }[]
  /** 按下确认条。草稿投影不出东西时什么都不做——不写空记录。 */
  confirmDraft: () => void
  /** 补录建议卡落账。与确认条共用同一个 commit，因此同样强制回执。 */
  commitBackfill: (input: BackfillCommitInput) => void
  receipt: GrimoireReceipt | null
  undo: () => void
  /**
   * 纯提示，不写任何东西（例如「长按可删除这枚标记」）。
   * 它永远不带 undoEntryId——没有写入就没有可撤销的东西，
   * 给一颗按下去什么都不发生的撤销键比不给更坏。
   */
  notify: (message: string) => void
  ghostsBySeat: Readonly<Record<number, readonly SeatGhostChip[]>>
  ghostLifeBySeat: Readonly<Record<number, 'dead' | 'alive'>>
}

export interface BackfillCommitInput {
  seatId: number
  draft: SeatStateDraft
  backfill: PlayerStateBackfill
  reason: string
}

export function useGrimoireWriteLayer(
  session: GameSessionState,
  dispatch: (action: GameSessionAction) => void,
): GrimoireWriteLayer {
  const [draft, setDraftState] = useState<SeatStateDraft | null>(null)
  const [segmentId, setSegmentId] = useState<string | null>(null)
  const [receipt, setReceipt] = useState<GrimoireReceipt | null>(null)

  const playerStates = useMemo(() => projectCurrentPlayerStates(session), [session])
  const segments = useMemo(() => projectOpenSegmentLabels(session), [session])
  // 默认记入当前相位：段落列表按时间排序，最后一个开着的段就是「现在」。
  const defaultSegmentId = segments.length ? segments[segments.length - 1].id : null
  const activeSegmentId = segmentId ?? defaultSegmentId

  const projected = draft ? projectSeatDraft(draft, playerStates[draft.seatId]) : null

  /**
   * dispatch 与回执在这里是一件事，不是两件。
   * 分开写的那一天，就会有一条路只做了前半件。
   */
  const commit = useCallback((
    action: Extract<GameSessionAction, { type: 'confirm-player-state-change' }>,
    message: string,
    undoable: boolean,
  ) => {
    dispatch(action)
    setReceipt({ id: Date.now(), message, undoEntryId: undoable ? action.entryId : null })
  }, [dispatch])

  const confirmDraft = useCallback(() => {
    if (!projected) return
    const confirmedAt = new Date().toISOString()
    commit(
      buildGrimoireWrite({
        projected,
        segmentId: activeSegmentId,
        entryId: newEntryId('grimoire'),
        confirmedAt,
        reason: '魔典上直接改的状态',
      }),
      `已记录：${projected.label}`,
      true,
    )
    setDraftState(null)
    setSegmentId(null)
  }, [activeSegmentId, commit, projected])

  const commitBackfill = useCallback((input: BackfillCommitInput) => {
    const next = projectSeatDraft(input.draft, playerStates[input.seatId])
    if (!next) return
    commit(
      buildGrimoireWrite({
        projected: next,
        segmentId: activeSegmentId,
        entryId: newEntryId('grimoire-backfill'),
        // 真实补录时刻，绝不回填。归属靠 backfill.attributedPhaseSegmentId 表达。
        confirmedAt: new Date().toISOString(),
        reason: input.reason,
        backfill: input.backfill,
      }),
      `已补录：${next.label}`,
      true,
    )
  }, [activeSegmentId, commit, playerStates])

  const undo = useCallback(() => {
    const targetId = receipt?.undoEntryId
    if (!targetId) return
    const entry = session.timeline.find(
      (candidate): candidate is PlayerStateChangedEntry => candidate.id === targetId && candidate.kind === 'player_state_changed',
    )
    // 撤销要落回原记录所在的段。段已经关了就写不进去，而 reducer 是**静默**拒绝的——
    // 不在这里拦住，撤销会「看起来成功」而实际什么都没发生。
    const segmentOpen = entry?.segmentId === null
      || session.phaseSegments.some((segment) => segment.id === entry?.segmentId && !segment.closedAt)
    const action = entry && segmentOpen
      ? buildGrimoireRevert({
        entry,
        current: playerStates[entry.seatId],
        entryId: newEntryId('grimoire-revert'),
        confirmedAt: new Date().toISOString(),
      })
      : null
    if (!action || !entry) {
      setReceipt({ id: Date.now(), message: '这条已经撤不回来了，请到本局记录里更正', undoEntryId: null })
      return
    }
    // 撤销的回执自己不可再撤销：撤销的撤销不是撤销，是一次新的状态变更。
    commit(action, `已撤销：${entry.reason}`, false)
  }, [commit, playerStates, receipt, session])

  const setDraft = useCallback((next: SeatStateDraft) => {
    setDraftState(next)
    setSegmentId(null)
  }, [])

  const clearDraft = useCallback(() => setDraftState(null), [])

  const notify = useCallback((message: string) => {
    setReceipt({ id: Date.now(), message, undoEntryId: null })
  }, [])

  // 环上的幽灵：草稿有且仅有一份，所以这两张表最多各有一项。
  // 做成表而不是单值，是为了让 GrimoireCanvas 按座位取，不必知道「当前草稿」这个概念。
  const ghostsBySeat: Record<number, readonly SeatGhostChip[]> = {}
  const ghostLifeBySeat: Record<number, 'dead' | 'alive'> = {}
  if (draft && projected) {
    if (draft.kind === 'life') {
      ghostLifeBySeat[draft.seatId] = projected.after.life
    } else {
      ghostsBySeat[draft.seatId] = [{
        key: draft.kind === 'marker-add' ? `add-${draft.markerId}` : `${draft.kind}-${draft.markerId ?? ''}`,
        label: projected.label,
        source: draft.source,
      }]
    }
  }

  return {
    draft,
    projected,
    setDraft,
    clearDraft,
    segmentId: activeSegmentId,
    setSegmentId,
    segments,
    confirmDraft,
    commitBackfill,
    receipt,
    undo,
    notify,
    ghostsBySeat,
    ghostLifeBySeat,
  }
}
