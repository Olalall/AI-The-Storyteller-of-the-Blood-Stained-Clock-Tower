import { ArrowRight, PencilLine, RotateCcw } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { StickyActionBar } from '../../../components/ui/StickyActionBar'
import { wakeShortLabel } from '../state/systemSteps'
import { isCorrectionMode, isPreviewMode, type WorkbenchMode } from '../state/workbenchMode'
import type { WakeItem } from '../types'

interface NightActionBarProps {
  activeItem: WakeItem
  current: WakeItem
  mode: WorkbenchMode
  /**
   * 唯一的写入闸门，由 useNightWorkbench 算好后自上而下传。本组件不得自己推导它：
   * 旧代码里 `isSettled` 与 `isReadOnly` 是同一个谓词的两份拷贝，一处改了另一处不会跟着改。
   */
  readOnly: boolean
  missingReason: string
  canConfirm: boolean
  activeLabel: string
  previewLabel: string
  concealed?: boolean
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
  mode,
  readOnly,
  missingReason,
  canConfirm,
  activeLabel,
  previewLabel,
  concealed = false,
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
  const correcting = isCorrectionMode(mode)
  if (isPreviewMode(mode)) {
    return <StickyActionBar>
      <div className="preview-action-bar">
        <Button variant="secondary" aria-label={`退出预览，回到正在处理的${activeLabel}；夜间处理位置不变`} onClick={onReturnCurrent}>回到{wakeShortLabel(activeItem, concealed)}</Button>
        <Button variant="primary" aria-label={`将夜间处理位置切换到${previewLabel}；不确认或保存记录`} onClick={onActivatePreview}>处理{wakeShortLabel(current, concealed)}</Button>
      </div>
    </StickyActionBar>
  }

  // 走到这里已排除预览态，此时 readOnly 恰好等于旧代码里的 isSettled / isReadOnly
  // （两者本就是同一个谓词：已确认且不在更正 / 已暂缓 / 本夜不适用）。
  return <StickyActionBar>
    {missingReason && !readOnly ? <div className="action-bar__hint">还差：{missingReason}</div> : null}
    <div className="action-bar__secondary">
      {current.progress === 'deferred' ? <Button variant="secondary" onClick={onResume}><RotateCcw aria-hidden="true" />恢复处理</Button>
        : current.progress === 'confirmed' && !correcting ? <Button variant="secondary" onClick={onBeginCorrection}><PencilLine aria-hidden="true" />追加更正</Button>
          : <Button variant="ghost" onClick={correcting ? onCancelCorrection : onDefer} disabled={readOnly}>{correcting ? '暂不更正' : '稍后处理'}</Button>}
    </div>
    <div className="action-bar__primary">
      {readOnly ? <Button variant="primary" onClick={onAdvance}>进入下一位 <ArrowRight aria-hidden="true" /></Button>
        : <>
          <Button variant="secondary" onClick={onConfirmStay} disabled={!canConfirm}>{correcting ? '确认更正' : '确认本项'}</Button>
          <Button variant="primary" onClick={onConfirmNext} disabled={!canConfirm}>{correcting ? '更正并下一位' : '确认并下一位'}<ArrowRight aria-hidden="true" /></Button>
        </>}
    </div>
  </StickyActionBar>
}
