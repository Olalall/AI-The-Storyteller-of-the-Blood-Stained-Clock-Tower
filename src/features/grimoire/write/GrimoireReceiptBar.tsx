/**
 * 魔典写入的回执带：一条 HostNotice + 一颗只活 3.5 秒的撤销键。
 *
 * 三件事必须同时成立，少一件这块就白做：
 *
 * 1. **撤销键在 live region 之外**。HostNotice 的 action 槽就是为这条开的：
 *    塞进 aria-live 区域会重复朗读，超时移除时还会把焦点丢回 body。
 * 2. **3.5 秒是给眼睛的，不是给键盘的**。焦点落在撤销键上时倒计时暂停——
 *    键盘用户 Tab 过去、读屏用户听完那句话，都不止 3.5 秒；
 *    在他按下之前把按钮抽走，等于给了一个只有鼠标用户能用的撤销。
 * 3. **超时之后不是没救了**。文案明说走本局记录的更正路径，而不是让人以为
 *    这条记录从此改不了了。
 */
import { Undo2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { HostNotice } from '../../../components/ui/HostNotice'
import type { GrimoireReceipt } from './useGrimoireWriteLayer'

/** 即时撤销的时间窗。与 HostNotice 的默认自动收起同为 3.5 秒，但两者是两件事。 */
export const UNDO_WINDOW_MS = 3500

interface GrimoireReceiptBarProps {
  receipt: GrimoireReceipt | null
  onUndo: () => void
}

export function GrimoireReceiptBar({ receipt, onUndo }: GrimoireReceiptBarProps) {
  const [expired, setExpired] = useState(false)
  /** 焦点在撤销键上时暂停计时；离开时从头再给一次完整的窗口。 */
  const [paused, setPaused] = useState(false)
  const receiptId = receipt?.id ?? null
  const undoEntryId = receipt?.undoEntryId ?? null
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setExpired(false)
    setPaused(false)
  }, [receiptId])

  useEffect(() => {
    if (!undoEntryId || paused) return
    timer.current = setTimeout(() => setExpired(true), UNDO_WINDOW_MS)
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [undoEntryId, paused, receiptId])

  const undoable = Boolean(undoEntryId) && !expired

  return (
    <HostNotice
      className="grimoire-receipt"
      message={receipt?.message ?? ''}
      action={undoable ? (
        <Button
          type="button"
          variant="ghost"
          compact
          onClick={onUndo}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          aria-label={`撤销刚才那一下：${receipt?.message ?? ''}`}
        >
          <Undo2 aria-hidden="true" />撤销
        </Button>
      ) : undefined}
    />
  )
}
