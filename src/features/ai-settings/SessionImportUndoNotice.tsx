import { RotateCcw, X } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import './session-import-undo.css'

interface SessionImportUndoNoticeProps {
  onUndo: () => void
  onDismiss: () => void
}

/** 导入会整局替换；在当前页面保留一条显式撤销路径，避免“导错文件只能认栽”。 */
export function SessionImportUndoNotice({ onUndo, onDismiss }: SessionImportUndoNoticeProps) {
  return (
    <section className="session-import-undo" role="status" aria-label="对局恢复结果">
      <span><strong>已恢复备份对局</strong><small>如果选错文件，可立即撤销并回到恢复前的对局。</small></span>
      <Button type="button" variant="secondary" compact onClick={onUndo}><RotateCcw aria-hidden="true" />撤销这次恢复</Button>
      <button type="button" className="session-import-undo__dismiss" aria-label="保留已恢复对局" onClick={onDismiss}><X aria-hidden="true" /></button>
    </section>
  )
}
