import { AlertTriangle, Download, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { clearSessionRecovery, readSessionRecovery } from '../../../services/session'
import { downloadTextFile } from '../../../services/session/exportSession'
import './session-recovery-notice.css'

function downloadRaw(raw: string, savedAt: string) {
  downloadTextFile(`botc-session-recovery-${savedAt.replace(/[:.]/g, '-')}.json`, raw)
}

/**
 * 只在上一份存档读不出时出现。它不尝试修复数据，只保证原文可被导出——
 * 说书人可以拿着这份文件找人恢复，而不是发现对局凭空消失。
 */
export function SessionRecoveryNotice() {
  const [recovery, setRecovery] = useState(readSessionRecovery)
  if (!recovery) return null

  const savedAtLabel = new Date(recovery.savedAt).toLocaleString('zh-CN')
  const reasonLabel = recovery.reason === 'parse-error' ? '文件内容不完整' : '文件结构不被识别'

  return (
    <section className="session-recovery" role="alert">
      <AlertTriangle aria-hidden="true" />
      <div className="session-recovery__body">
        <strong>上一份存档没能读出，已为你留档</strong>
        <span>
          {savedAtLabel} · {reasonLabel} · {recovery.byteLength} 字节。
          当前是一局新的对局；原文件仍可导出，导出后再关闭此提示。
        </span>
      </div>
      <div className="session-recovery__actions">
        <Button
          variant="primary"
          compact
          onClick={() => downloadRaw(recovery.raw, recovery.savedAt)}
          disabled={!recovery.raw}
        >
          <Download aria-hidden="true" />导出原文
        </Button>
        <Button
          variant="ghost"
          compact
          onClick={() => { clearSessionRecovery(); setRecovery(null) }}
          aria-label="关闭存档恢复提示"
        >
          <X aria-hidden="true" />
        </Button>
      </div>
    </section>
  )
}
