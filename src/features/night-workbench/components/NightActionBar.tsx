import { ArrowRight, PencilLine, RotateCcw } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { StickyActionBar } from '../../../components/ui/StickyActionBar'
import type { WakeItem } from '../types'

interface NightActionBarProps {
  activeItem: WakeItem
  current: WakeItem
  isPreviewing: boolean
  isReadOnly: boolean
  isCorrecting: boolean
  isSettled: boolean
  missingReason: string
  canConfirm: boolean
  activeLabel: string
  previewLabel: string
  onReturnCurrent: () => void
  onActivatePreview: () => void
  onResume: () => void
  onBeginCorrection: () => void
  onCancelCorrection: () => void
  onDefer: () => void
  onAdvance: () => void
  onConfirmStay: () => void
  onConfirmNext: () => void
}

export function NightActionBar({
  activeItem,
  current,
  isPreviewing,
  isReadOnly,
  isCorrecting,
  isSettled,
  missingReason,
  canConfirm,
  activeLabel,
  previewLabel,
  onReturnCurrent,
  onActivatePreview,
  onResume,
  onBeginCorrection,
  onCancelCorrection,
  onDefer,
  onAdvance,
  onConfirmStay,
  onConfirmNext,
}: NightActionBarProps) {
  if (isPreviewing) {
    return <StickyActionBar>
      <div className="preview-action-bar">
        <Button variant="secondary" aria-label={`退出预览，回到正在处理的${activeLabel}；夜间处理位置不变`} onClick={onReturnCurrent}>回到{activeItem.seatId}号</Button>
        <Button variant="primary" aria-label={`将夜间处理位置切换到${previewLabel}；不确认或保存记录`} onClick={onActivatePreview}>处理{current.seatId}号</Button>
      </div>
    </StickyActionBar>
  }

  return <StickyActionBar>
    {missingReason && !isSettled ? <div className="action-bar__hint">还差：{missingReason}</div> : null}
    <div className="action-bar__secondary">
      {current.progress === 'deferred' ? <Button variant="secondary" onClick={onResume}><RotateCcw aria-hidden="true" />恢复处理</Button>
        : current.progress === 'confirmed' && !isCorrecting ? <Button variant="secondary" onClick={onBeginCorrection}><PencilLine aria-hidden="true" />追加更正</Button>
          : <Button variant="ghost" onClick={isCorrecting ? onCancelCorrection : onDefer} disabled={isReadOnly}>{isCorrecting ? '暂不更正' : '稍后处理'}</Button>}
    </div>
    <div className="action-bar__primary">
      {isSettled ? <Button variant="primary" onClick={onAdvance}>进入下一位 <ArrowRight aria-hidden="true" /></Button>
        : <>
          <Button variant="secondary" onClick={onConfirmStay} disabled={!canConfirm}>{isCorrecting ? '确认更正' : '确认本项'}</Button>
          <Button variant="primary" onClick={onConfirmNext} disabled={!canConfirm}>{isCorrecting ? '更正并下一位' : '确认并下一位'}<ArrowRight aria-hidden="true" /></Button>
        </>}
    </div>
  </StickyActionBar>
}
