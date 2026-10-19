import { useState } from 'react'
import { Sheet } from '../../../components/ui/Sheet'
import { AlertTriangle, Download, RefreshCw } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import type { GameSessionState } from '../types'
import './session-recovery-notice.css'

export function SessionSaveNotice({ session, onRetry }: { session: GameSessionState; onRetry: () => void }) {
  const [open, setOpen] = useState(true)
  function exportSession() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `botc-session-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const notice = (
    <section className="session-recovery" role="alert" aria-label="对局保存失败">
      <AlertTriangle aria-hidden="true" />
      <div className="session-recovery__body">
        <strong>保存失败</strong>
        <span>当前对局仍在此页面中。请重试或导出备份，暂勿刷新或关闭页面。</span>
      </div>
      <div className="session-recovery__actions">
        <Button onClick={onRetry}><RefreshCw aria-hidden="true" />重试保存</Button>
        <Button variant="primary" onClick={exportSession}><Download aria-hidden="true" />导出对局</Button>
      </div>
    </section>
  )
  return <>
    {!open ? notice : null}
    <Sheet open={open} onOpenChange={setOpen} title="保存失败" description="修改仍在当前页面，请重试保存或导出备份。" layer="nested" contentClassName="sheet-content--save-recovery">
      {notice}
    </Sheet>
  </>
}
