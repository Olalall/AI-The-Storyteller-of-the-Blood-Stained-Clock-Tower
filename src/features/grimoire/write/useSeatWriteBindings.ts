/**
 * 把写入层的状态机接到「环上的手势」与「抽屉里的等价路径」两组入口上。
 *
 * 单独一层的理由是这两组入口必须**共用同一套语义**：
 * 环上第四格「加标记」和抽屉里那个输入框，产生的必须是同一份草稿、
 * 走同一条确认条、留下同一句 reason。抄两遍之后，键盘用户与触摸用户
 * 会在同一局里写出两种形状的记录，而复盘时没有任何办法看出为什么。
 *
 * 这一层自己不 dispatch 任何东西——它只把手势翻译成草稿，落账仍然只有
 * useGrimoireWriteLayer.confirmDraft 一个出口。
 */
import { useCallback, useEffect, useState } from 'react'
import { chipGestureFor } from './chipGesture'
import type { SeatActionCell } from './seatActions'
import type { GrimoireWriteLayer } from './useGrimoireWriteLayer'
import type { SeatChipGestureEvent } from '../seat/SeatChipLayer'

export interface SeatWriteBindings {
  /** 当前打开 SeatActionBar 的座位；null = 没开。 */
  actionBarSeatId: number | null
  openActionBar: (seatId: number) => void
  closeActionBar: () => void
  /** 六格里前四格：只写草稿。 */
  draftFromCell: (seatId: number, cell: SeatActionCell) => void
  addMarker: (seatId: number, label: string) => void
  removeMarker: (seatId: number, markerId: string) => void
  handleChipGesture: (seatId: number, event: SeatChipGestureEvent) => void
}

export function useSeatWriteBindings(write: GrimoireWriteLayer, phaseKey: string): SeatWriteBindings {
  const [actionBarSeatId, setActionBarSeatId] = useState<number | null>(null)
  const { clearDraft, confirmDraft, notify, setDraft } = write

  // 相位一换就把草稿与浮层全部清掉。常驻画布上最容易出的错，
  // 是把上一夜没确认的幽灵当成今晚的真实局面读——它长得就像一枚淡一点的标记。
  useEffect(() => {
    clearDraft()
    setActionBarSeatId(null)
  }, [clearDraft, phaseKey])

  const openActionBar = useCallback((seatId: number) => setActionBarSeatId(seatId), [])
  const closeActionBar = useCallback(() => setActionBarSeatId(null), [])

  const draftFromCell = useCallback((seatId: number, cell: SeatActionCell) => {
    if (!cell.draftKind || cell.draftKind === 'marker-add' || cell.draftKind === 'marker-remove') return
    setDraft({ seatId, kind: cell.draftKind, source: 'storyteller' })
    setActionBarSeatId(null)
  }, [setDraft])

  const addMarker = useCallback((seatId: number, label: string) => {
    setDraft({
      seatId,
      kind: 'marker-add',
      markerLabel: label,
      // id 在草稿这一刻就定下来：环上那枚幽灵 chip 和最终落账的 token 必须是同一个 id，
      // 落账时再生成的话，「幽灵变实体」在数据上是换了一枚标记。
      markerId: `grimoire-${seatId}-${Date.now()}`,
      source: 'storyteller',
    })
    setActionBarSeatId(null)
  }, [setDraft])

  const removeMarker = useCallback((seatId: number, markerId: string) => {
    setDraft({ seatId, kind: 'marker-remove', markerId, source: 'storyteller' })
    setActionBarSeatId(null)
  }, [setDraft])

  const handleChipGesture = useCallback((seatId: number, event: SeatChipGestureEvent) => {
    // 分派条件是「这枚 chip 是不是草稿」，不是它长什么样：
    // 草稿长按 = 否决，已落盘长按 = 进入删除，两者在环上挨着且都是圆点。
    const contract = chipGestureFor(event.chip)
    if (event.hold === 'veto-draft') return clearDraft()
    if (event.hold === 'arm-delete' && event.chip.markerId) return removeMarker(seatId, event.chip.markerId)
    if (event.tap === 'commit-draft') return confirmDraft()
    if (event.tap === 'announce-hold') return notify(`${seatId}号 ${contract.hint}`)
  }, [clearDraft, confirmDraft, notify, removeMarker])

  return {
    actionBarSeatId,
    openActionBar,
    closeActionBar,
    draftFromCell,
    addMarker,
    removeMarker,
    handleChipGesture,
  }
}
